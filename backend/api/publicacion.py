import shutil
import time
from time import strftime
from typing import List, Optional
from zoneinfo import ZoneInfo

from reportlab.lib.colors import describe
from sqlalchemy import or_

from models import Publicacion
from models import ImagenPublicacion
import datetime
import os
from sqlalchemy.orm import Session, joinedload
from utils.database import get_db
from fastapi import APIRouter,Depends, HTTPException, UploadFile, File, Form,Request
from utils.dependencies import current_user, admin_required

router=APIRouter(prefix="/publication", tags=["publication"])

MAZATLAN_TZ = ZoneInfo("America/Mazatlan")

#link_api="http://localhost:8000/"

@router.post("/create/publication")
def crear_publicacion(titulo:str,contenido:str,db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        user_id=admin_data["id_usuario"]
        fecha=datetime.datetime.now(MAZATLAN_TZ)
        public=Publicacion(id_usuario=user_id,contenido=contenido,titulo=titulo,fecha_hora=fecha)
        db.add(public)
        db.commit()
        db.refresh(public)

        return {"message": "Publicación creada correctamente", "id_publicacion": public.id_publicacion}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/create/publication_imagenes")
def crear_publicacion_imagenes(titulo:str = Form(...),contenido:str = Form(None),imagenes: List[UploadFile] = File(None),db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        user_id=admin_data["id_usuario"]
        fecha=datetime.datetime.now(MAZATLAN_TZ)

        public=Publicacion(id_usuario=user_id,contenido=contenido if contenido else "",titulo=titulo,fecha_hora=fecha)
        db.add(public)
        db.commit()
        db.refresh(public)

        carpeta = f"Images/Publicaciones/{public.id_publicacion}/"
        os.makedirs(carpeta, exist_ok=True)

        if imagenes and len(imagenes) > 0:
            for imagen in imagenes:
                nombre_archivo = imagen.filename
                ruta = os.path.join(carpeta, nombre_archivo)

                # Guardar físicamente
                with open(ruta, "wb") as f:
                    f.write(imagen.file.read())


                img = ImagenPublicacion(id_publicacion=public.id_publicacion,ruta=ruta)
                db.add(img)

            db.commit()
            return {"message": "Publicación creada correctamente", "id_publicacion": public.id_publicacion}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/delete/publication")
def delete_publicacion(id_publicacion:int,db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        publicacion = db.query(Publicacion).filter(Publicacion.id_publicacion == id_publicacion).first()

        if not publicacion:
            raise HTTPException(status_code=404, detail="Publicación no encontrada")

        db.query(ImagenPublicacion).filter(ImagenPublicacion.id_publicacion == id_publicacion).delete()
        db.query(Publicacion).filter(Publicacion.id_publicacion == id_publicacion).delete()
        db.commit()


        carpeta_delete = os.path.join("Images", "Publicaciones", str(id_publicacion))
        if os.path.exists(carpeta_delete):
            try:
                max_intentos = 3
                for intento in range(max_intentos):
                    try:
                        shutil.rmtree(carpeta_delete)
                        break
                    except PermissionError:
                        if intento < max_intentos - 1:
                            time.sleep(0.5)  # Espera 500ms antes de reintentar
                            continue
                        else:
                            print(f"No se pudo eliminar la carpeta {carpeta_delete}")
            except Exception as e:
                print(f"Error al eliminar carpeta física: {e}")
        return {"msg": "Publicación eliminada con éxito"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en delete_publicacion: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar publicación: {str(e)}")


@router.put("/edit/publication")
def editar_publicacion(id_publicacion: int = Form(...),titulo: Optional[str] = Form(None),contenido: Optional[str] = Form(None),
        imagenes: List[UploadFile] = File(default=[]),imagenes_eliminar: Optional[str] = Form(None),
        db: Session = Depends(get_db),admin_data: dict = Depends(admin_required)):
    try:
        public = db.query(Publicacion).filter(Publicacion.id_publicacion == id_publicacion).first()
        if not public:
            raise HTTPException(status_code=404, detail="Publicación no encontrada")

        if titulo:
            public.titulo = titulo

        public.contenido = contenido

        if imagenes_eliminar:
            import json
            ids_eliminar = json.loads(imagenes_eliminar)

            for img_id in ids_eliminar:
                img = db.query(ImagenPublicacion).filter(ImagenPublicacion.id_imagen == img_id,
                    ImagenPublicacion.id_publicacion == id_publicacion).first()
                if img:
                    if os.path.exists(img.ruta):
                        try:
                            os.remove(img.ruta)
                        except Exception as e:
                            raise HTTPException(status_code=400, detail=str(e))
                    db.delete(img)

        if imagenes and len(imagenes) > 0:
            imagenes_actuales = db.query(ImagenPublicacion).filter(ImagenPublicacion.id_publicacion == id_publicacion).count()

            total_imagenes = imagenes_actuales + len(imagenes)

            if total_imagenes > 4:
                raise HTTPException(status_code=400,detail=f"Solo puedes tener máximo 4 imágenes. Actualmente tienes {imagenes_actuales}")

            carpeta = f"Images/Publicaciones/{id_publicacion}/"
            os.makedirs(carpeta, exist_ok=True)

            for imagen in imagenes:
                if imagen.filename:
                    nombre_archivo = imagen.filename
                    ruta = os.path.join(carpeta, nombre_archivo)
                    with open(ruta, "wb") as f:
                        f.write(imagen.file.read())
                    nueva_img = ImagenPublicacion(id_publicacion=id_publicacion,ruta=ruta)
                    db.add(nueva_img)
        db.commit()

        return {"message": "Publicación editada correctamente"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/get/publication")
def get_publicacion(
        id_publicacion: int,
        request: Request,
        db: Session = Depends(get_db)
    ):
    try:
        public = (db.query(Publicacion)
                    .options(joinedload(Publicacion.imagenes))
                    .filter(Publicacion.id_publicacion == id_publicacion)
                    .first())

        if not public:
            raise HTTPException(status_code=404, detail="Publicación no encontrada")

        # Base URL para armar rutas completas de imágenes
        base_url = str(request.base_url).rstrip("/")

        # Formato igual al de show/publication
        return {
            "id_publicacion": public.id_publicacion,
            "titulo": public.titulo,
            "contenido": public.contenido,
            "fecha_hora": public.fecha_hora.strftime("%d/%m/%Y"),
            "imagenes": [
                {
                    "id": img.id_imagen,
                    "ruta": f"{base_url}/{img.ruta}"
                }
                for img in public.imagenes
            ]
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/show/publication")
def get_publications(request:Request,db:Session = Depends(get_db)):
    try:
        publicaciones=(db.query(Publicacion).options(joinedload(Publicacion.imagenes))
                       .order_by(Publicacion.fecha_hora.desc()).limit(20).all())

        base_url= str(request.base_url).rstrip("/")
        publics = []
        for pub in publicaciones:
            publics.append({
                "id_publicacion": pub.id_publicacion,
                "titulo": pub.titulo,
                "contenido": pub.contenido,
                "fecha_hora": pub.fecha_hora.strftime("%d/%m/%Y"),
                "imagenes": [{"id": img.id_imagen,
                              "ruta": f"{base_url}/{img.ruta}"
                              } for img in pub.imagenes]
            })

        return publics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



@router.get("/search/publication")
def search_publications(request:Request,texto:str,db:Session = Depends(get_db)):
    try:
        query=db.query(Publicacion).options(joinedload(Publicacion.imagenes))

        query=query.filter(or_(Publicacion.titulo.ilike(f"%{texto}%"),Publicacion.contenido.ilike(f"%{texto}%")))

        publicaciones=query.order_by(Publicacion.fecha_hora.desc()).limit(20).all()
        base_url = str(request.base_url).rstrip("/")
        resultado=[]
        for pub in publicaciones:
            resultado.append({
                "id_publicacion": pub.id_publicacion,
                "titulo": pub.titulo,
                "contenido": pub.contenido,
                "fecha_hora": pub.fecha_hora.strftime("%d/%m/%Y"),
                "imagenes": [{"id": img.id_imagen,
                              "ruta": f"{base_url}/{img.ruta}"
                              } for img in pub.imagenes]
            })
        return resultado
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))