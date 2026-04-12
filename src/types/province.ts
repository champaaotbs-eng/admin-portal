export interface IProvince {
    provinceId: string
    name: string
    code: string
    divisionType: string
    wards?: IWard[]
}

export interface IWard {
    wardId: string
    provinceId: string
    name: string
    code: string
    divisionType: string
}
