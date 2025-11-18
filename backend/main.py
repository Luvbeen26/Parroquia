from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


from routers import api_router


app=FastAPI(title="Parroquia")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #Controla en que dominios puede usarse la api (cambiar cuando se levante)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.mount("/Images",StaticFiles(directory="Images"), name="Images")
app.mount("/Documents", StaticFiles(directory="Documents"), name="Documents")


@app.get("/")
def read_root():
    return {"Hello": "World"}
