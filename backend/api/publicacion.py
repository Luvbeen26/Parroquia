import shutil
from time import strftime
from typing import List, Optional

from reportlab.lib.colors import describe
from sqlalchemy import or_

from models import Publicacion
from models import ImagenPublicacion
import datetime
import os
from sqlalchemy.orm import Session, joinedload
from utils.database import get_db
from fastapi import APIRouter,Depends, HTTPException, UploadFile, File, Form
from utils.dependencies import current_user, admin_required

router=APIRouter(prefix="/publication", tags=["publication"])

@router.post("/create/publication")
def crear_publicacion(titulo:str,contenido:str,db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        user_id=admin_data["id_usuario"]
        fecha=datetime.datetime.now()
        public=Publicacion(id_usuario=user_id,contenido=contenido,titulo=titulo,fecha_hora=fecha)
        db.add(public)
        db.commit()
        db.refresh(public)

        return {"message": "Publicación creada correctamente", "id_publicacion": public.id_publicacion}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/create/publication_imagenes")
def crear_publicacion_imagenes(titulo:str = Form(...),contenido:str = Form(...),imagenes: List[UploadFile] = File(None),db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        user_id=admin_data["id_usuario"]
        fecha=datetime.datetime.now()
        public=Publicacion(id_usuario=user_id,contenido=contenido,titulo=titulo,fecha_hora=fecha)
        db.add(public)
        db.commit()
        db.refresh(public)

        carpeta = f"Images/Publicaciones/{public.id_publicacion}/"
        os.makedirs(carpeta, exist_ok=True)


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
        carpeta_delete=os.path.join("Images","Publicaciones",str(id_publicacion))
        if os.path.exists(carpeta_delete):
            shutil.rmtree(carpeta_delete)
            db.query(ImagenPublicacion).filter(ImagenPublicacion.id_publicacion == id_publicacion).delete()

        db.query(Publicacion).filter(Publicacion.id_publicacion == id_publicacion).delete()
        db.commit()
        return {"msg" : "Publicaciones eliminados"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/edit/publication")
def editar_publicacion(id_publicacion: int,titulo: Optional[str] = Form(None),contenido: Optional[str] = Form(None),
        imagenes: Optional[List[UploadFile]] = File(None),db: Session = Depends(get_db),admin_data: dict = Depends(admin_required)):
    try:

        public = db.query(Publicacion).filter(Publicacion.id_publicacion == id_publicacion).first()
        if not public:
            raise HTTPException(status_code=404, detail="Publicación no encontrada")

        if titulo:
            public.titulo = titulo
        if contenido:
            public.contenido = contenido

        carpeta = f"Images/Publicaciones/{id_publicacion}/"
        os.makedirs(carpeta, exist_ok=True)

        if imagenes:
            if len(imagenes) > 4:
                raise HTTPException(status_code=400, detail="Máximo 4 imágenes permitidas")

            imagenes_actuales = db.query(ImagenPublicacion).filter(ImagenPublicacion.id_publicacion == id_publicacion).all()

            for img in imagenes_actuales:
                if os.path.exists(img.ruta):
                    os.remove(img.ruta)
                db.delete(img)

            for imagen in imagenes:
                nombre_archivo = imagen.filename
                ruta = os.path.join(carpeta, nombre_archivo)

                with open(ruta, "wb") as f:
                    f.write(imagen.file.read())

                nueva_img = ImagenPublicacion(id_publicacion=id_publicacion, ruta=ruta)
                db.add(nueva_img)
        db.commit()
        return {"message": "Publicación editada correctamente"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/show/publication")
def get_publications(db:Session = Depends(get_db)):
    try:
        publicaciones=(db.query(Publicacion).options(joinedload(Publicacion.imagenes))
                       .order_by(Publicacion.fecha_hora.desc()).limit(20).all())

        publics = []
        for pub in publicaciones:
            publics.append({
                "id_publicacion": pub.id_publicacion,
                "titulo": pub.titulo,
                "contenido": pub.contenido,
                "fecha_hora": pub.fecha_hora.strftime("%d/%m/%Y"),
                "imagenes": [{"id": img.id_imagen, "ruta": img.ruta} for img in pub.imagenes]
            })

        return publics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/show/publication")
def get_publications(db:Session = Depends(get_db)):
    try:
        publicaciones=(db.query(Publicacion).options(joinedload(Publicacion.imagenes))
                       .order_by(Publicacion.fecha_hora.desc()).limit(20).all())

        publics = []
        for pub in publicaciones:
            publics.append({
                "id_publicacion": pub.id_publicacion,
                "titulo": pub.titulo,
                "contenido": pub.contenido,
                "fecha_hora": pub.fecha_hora.strftime("%d/%m/%Y"),
                "imagenes": [{"id": img.id_imagen, "ruta": img.ruta} for img in pub.imagenes]
            })

        return publics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/search/publication")
def search_publications(texto:str,db:Session = Depends(get_db)):
    try:
        query=db.query(Publicacion).options(joinedload(Publicacion.imagenes))

        query=query.filter(or_(Publicacion.titulo.ilike(f"%{texto}%"),Publicacion.contenido.ilike(f"%{texto}%")))

        publicaciones=query.order_by(Publicacion.fecha_hora.desc()).limit(20).all()

        resultado=[]
        for pub in publicaciones:
            resultado.append({
                "id_publicacion": pub.id_publicacion,
                "titulo": pub.titulo,
                "contenido": pub.contenido,
                "fecha_hora": pub.fecha_hora.strftime("%d/%m/%Y"),
                "imagenes": [{"id": img.id_imagen, "ruta": img.ruta} for img in pub.imagenes]
            })
        return resultado
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))