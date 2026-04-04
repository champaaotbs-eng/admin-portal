import { type IFile } from "types/file"
import { api } from "utils/axios.instance"

export const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<IFile>('/v1/files', formData)

    return response
}

export const deleteFile = async (publicId: string) => {
    await api.delete(`/v1/files/${publicId}`)
}
