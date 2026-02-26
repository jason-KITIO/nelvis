import { fetchWithAuth } from "@/lib/fetch-with-auth";
import type {
  NoteDeFrais,
  UpdateNoteDeFraisRequest,
} from "@/types/note-frais";

export const noteFraisService = {
  async list(orgId: string): Promise<NoteDeFrais[]> {
    const res = await fetchWithAuth(
      `/api/organisations/${orgId}/notes-frais`
    );
    const data = await res.json();
    return data.notesDeFrais;
  },

  async get(orgId: string, noteId: string): Promise<NoteDeFrais> {
    const res = await fetchWithAuth(
      `/api/organisations/${orgId}/notes-frais/${noteId}`
    );
    const data = await res.json();
    return data.noteDeFrais;
  },

  async upload(orgId: string, file: File): Promise<NoteDeFrais> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetchWithAuth(
      `/api/organisations/${orgId}/notes-frais`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await res.json();
    return data.noteDeFrais;
  },

  async update(
    orgId: string,
    noteId: string,
    data: UpdateNoteDeFraisRequest
  ): Promise<NoteDeFrais> {
    const res = await fetchWithAuth(
      `/api/organisations/${orgId}/notes-frais/${noteId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    const result = await res.json();
    return result.noteDeFrais;
  },

  async delete(orgId: string, noteId: string): Promise<void> {
    await fetchWithAuth(
      `/api/organisations/${orgId}/notes-frais/${noteId}`,
      {
        method: "DELETE",
      }
    );
  },
};
