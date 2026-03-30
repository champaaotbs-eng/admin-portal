import { type IFile } from "types/file"
import { api } from "utils/axios.instance"

export const uploadFile = async (file: File) => {
    const response = await api.post<IFile>('/v1/files', file, {
        headers: {
            'Content-Type': file.type,
        },
    })
    return response
}

export const deleteFile = async (publicId: string) => {
    await api.delete(`/v1/files/${publicId}`)
}
