import { http, HttpResponse } from 'msw';
import FoldersMock from '../mocks/FoldersMock.json';
import AllNotesMock from '../mocks/AllNotesMock.json';
import SpecificNotesMock from '../mocks/SpecificNotesMock.json';
import VersionsMock from '../mocks/VersionsMock.json';

export const handlers = [
    http.get('*/api/folders', () => {
        return HttpResponse.json(FoldersMock);
    }),
    http.get('*/api/notes', ({ request }) => {
        const url = new URL(request.url);

        if (url.searchParams.get('folder') !== 'all-notes') {
            return new HttpResponse(SpecificNotesMock, {
                status: 400
            });
        }

        return HttpResponse.json(AllNotesMock);
    }),
    http.delete('*/api/notes/delete', () => {
        return HttpResponse.json({
            data: [
                {
                    folder: 'work'
                }
            ]
        });
    }),
    http.get('*/api/versions/:noteId', ({ params, request }) => {
        const url = new URL(request.url);

        if (
            params.noteId === undefined ||
            url.searchParams.get('folder') === undefined
        ) {
            return HttpResponse.json(
                { message: 'Invalid request' },
                { status: 400 }
            );
        }

        return HttpResponse.json(VersionsMock);
    })
];