import { apiSlice } from '../api/apiSlice';

export interface IAnnouncement {
  _id: string;
  title: string;
  message: string;
  link?: string;
  linkText?: string;
  type: 'info' | 'warning' | 'success' | 'promotion';
  backgroundColor: string;
  textColor: string;
  priority: number;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  displayOrder: number;
  showCloseButton: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAddAnnouncement {
  title: string;
  message: string;
  link?: string;
  linkText?: string;
  type: 'info' | 'warning' | 'success' | 'promotion';
  backgroundColor?: string;
  textColor?: string;
  priority?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  displayOrder?: number;
  showCloseButton?: boolean;
}

export interface AnnouncementResponse {
  success: boolean;
  data: IAnnouncement[];
}

export interface AnnouncementAddResponse {
  success: boolean;
  message: string;
  data: IAnnouncement;
}

export interface AnnouncementDelResponse {
  success: boolean;
  message: string;
}

export const announcementApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    // get all announcements
    getAllAnnouncements: builder.query<AnnouncementResponse, void>({
      query: () => `/api/announcement`,
      providesTags: ['AllAnnouncements'],
      keepUnusedDataFor: 600,
    }),
    // get active announcements (public)
    getActiveAnnouncements: builder.query<AnnouncementResponse, void>({
      query: () => `/api/announcement/active`,
      providesTags: ['ActiveAnnouncements'],
      keepUnusedDataFor: 300,
    }),
    // add announcement
    addAnnouncement: builder.mutation<AnnouncementAddResponse, IAddAnnouncement>({
      query(data: IAddAnnouncement) {
        return {
          url: `/api/announcement`,
          method: 'POST',
          body: data,
        };
      },
      invalidatesTags: ['AllAnnouncements', 'ActiveAnnouncements'],
    }),
    // edit announcement
    editAnnouncement: builder.mutation<
      AnnouncementAddResponse,
      { id: string; data: Partial<IAddAnnouncement> }
    >({
      query({ id, data }) {
        return {
          url: `/api/announcement/${id}`,
          method: 'PATCH',
          body: data,
        };
      },
      invalidatesTags: ['AllAnnouncements', 'ActiveAnnouncements', 'getAnnouncement'],
    }),
    // get single announcement
    getAnnouncement: builder.query<IAnnouncement, string>({
      query: id => `/api/announcement/${id}`,
      providesTags: ['getAnnouncement'],
      transformResponse: (response: { success: boolean; data: IAnnouncement }) =>
        response.data,
    }),
    // toggle announcement status
    toggleAnnouncementStatus: builder.mutation<AnnouncementAddResponse, string>({
      query(id: string) {
        return {
          url: `/api/announcement/${id}/toggle-status`,
          method: 'PATCH',
        };
      },
      invalidatesTags: ['AllAnnouncements', 'ActiveAnnouncements'],
    }),
    // delete announcement
    deleteAnnouncement: builder.mutation<AnnouncementDelResponse, string>({
      query(id: string) {
        return {
          url: `/api/announcement/${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['AllAnnouncements', 'ActiveAnnouncements'],
    }),
  }),
});

export const {
  useGetAllAnnouncementsQuery,
  useGetActiveAnnouncementsQuery,
  useDeleteAnnouncementMutation,
  useAddAnnouncementMutation,
  useEditAnnouncementMutation,
  useGetAnnouncementQuery,
  useToggleAnnouncementStatusMutation,
} = announcementApi;

