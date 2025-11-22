export interface RegFinanza{
    monto: number,
    descripcion: string,
    id_categoria:number,
    evidencia: string | null
}

export interface GetAllFinanzas extends RegFinanza{
    id_transaccion: number,
    fecha: string,
    categoria: string,
    tipo_categoria: string,
}

