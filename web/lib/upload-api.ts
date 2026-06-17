const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export type UploadVisitPhotoResponse = {
  url: string;
};

export const uploadVisitPhoto = async (
  file: File,
): Promise<UploadVisitPhotoResponse> => {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE_URL}/uploads/visit-photo`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error('로그인이 필요합니다.');
  }

  if (!res.ok) {
    let message = '사진 업로드에 실패했습니다.';
    try {
      const body = (await res.json()) as {
        message?: string | string[];
      };
      if (Array.isArray(body.message)) {
        message = body.message.join(', ');
      } else if (typeof body.message === 'string') {
        message = body.message;
      }
    } catch {
      if (res.status === 400) {
        message = 'jpeg, png, webp · 5MB 이하만 업로드할 수 있습니다.';
      }
      if (res.status === 503) {
        message = '사진 업로드 설정이 되어 있지 않습니다.';
      }
    }
    throw new Error(message);
  }

  return res.json() as Promise<UploadVisitPhotoResponse>;
};
