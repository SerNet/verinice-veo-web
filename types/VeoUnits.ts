export interface IVeoDomain {
    displayName: string
    searchesUri: string
    targetUri: string
}

export interface IVeoUnit {
    id: string
    createdAt: string
    createdBy: string
    updatedAt: string
    updatedBy: string
    name: string
    domains: IVeoDomain[]
    units: IVeoUnit[]
}
