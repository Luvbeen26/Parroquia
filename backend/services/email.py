from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

from config.setting import settings

conf = ConnectionConfig(
    MAIL_USERNAME = settings.SMTP_EMAIL,
    MAIL_PASSWORD = settings.SMTP_PASSWORD,
    MAIL_FROM = settings.SMTP_EMAIL,
    MAIL_PORT = 587,
    MAIL_SERVER = settings.SMTP_HOST,
    MAIL_FROM_NAME="Parroquia",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)



async def send_email(code:str, correo:str, sujeto:str):
    try:

        body = f"""
            <div style="background-color: #1D293D; padding:20px">
                <h1 style="text-align:center;color:#FFFF;">CODIGO DE VERIFICACION</h1> 
                <h3 style="text-align:center;color:#FFFF;">Tu codigo de verificacion es </h3>
                <div style="text-align:center;">
                    <span style="display:inline-block; padding: 10px 20px;color: #F8DF00; border-radius:5px; 
                     background-color:#314158; font-size:1.5rem; font-weight:bold;">
                    {code}
                    </span>
                </div>
        """

        message = MessageSchema(
            subject=sujeto,
            recipients=[correo],
            body=body,
            subtype="html"
        )

        fm = FastMail(conf)
        await fm.send_message(message)
    except Exception as e:
        print(e)
        return e






async def send_email_comprobante(ruta:str, correo:str, sujeto:str):
    try:

        body = f"""
               <div style="background-color: #1D293D; padding:20px">
                   <h1 style="text-align:center;color:#FFFF;">COMPROBANTE DE PAGO</h1> 
                   <h3 style="text-align:center;color:#FFFF;">Estimado cliente,</h3>
                   <p style="text-align:center;color:#FFFF;">
                       Adjunto encontrarás tu comprobante de pago generado por el sistema.
                   </p>
                   <div style="text-align:center;color:#F8DF00;margin-top:15px;">
                       Gracias por tu preferencia.
                   </div>
               </div>
           """


        message = MessageSchema(
            subject=sujeto,
            recipients=[correo],
            body=body,
            subtype="html",
            attachments=[ruta]
        )

        fm = FastMail(conf)
        await fm.send_message(message)
    except Exception as e:
        print(e)
        return e