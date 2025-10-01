import requests
from prueba import operaciones

url="http://127.0.0.1:8000"

consulta={
        "nombres": "America Lizbeth",
        "apellidos": "Vega Fierrro",
        "correo": "Ammeli77@hotmail.com",
        "contra": "POPOcatepptl2012",
        "confirm_pswd":"POPOcatepptl2012"
}


op=operaciones()
def test_sum():
    assert op.sum(2,5) == 7
    assert op.mayorque(2,5) == False
#    assert op.sum(2,5) == 8
    #for i in range(2000):
    response=requests.post(url+"/create_user",json=consulta)
    assert response.status_code == 200
 #   assert op.sum(2,5) == 7
  #  assert op.sum(3,5) == 8
   # assert op.sum(9,10) == 14