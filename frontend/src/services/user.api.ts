// Utils
import { apiFileRequest, apiRequest } from "@/utils/fetcher";

// Types
import type { IMessageResponse, IPaginatedResponse } from "@shared/interfaces/api/response.interface";
import type{ IListQueryParams } from "@shared/interfaces/api/param.interface";
import type {
    IUser,
    IProfile,
    TUserResponse,
    
} from "@shared/interfaces/user.interface";
import type {
    TUserData,
    TUpdateProfileData,
    TUserResetPasswordData
} from "@shared/types/user.type";
import { generateQueryParams } from "@/utils";

// Constants
const USERS_API_PATH = "/users";
const PROFILES_API_PATH = USERS_API_PATH + "/profiles";

export const me = async () =>
    apiRequest<IUser>(`${USERS_API_PATH}/me`, "GET");


export const createUser = (data: TUserData) =>
    apiRequest<TUserResponse>(`${USERS_API_PATH}`, "POST", data);

export const updateUser = (id: number) => (data: Partial<TUserData>) =>
    apiRequest<IMessageResponse>(
        `${USERS_API_PATH}/${id}`,
        "PATCH",
        data
    );

export const fetchUsers = (
    params: IListQueryParams,
    level?: number
) => {

    const queryParams = new URLSearchParams();
    if (level) queryParams.append("level", level.toString());
    generateQueryParams(queryParams, params);


    let apiPath = `${USERS_API_PATH}`;
    return apiRequest<IPaginatedResponse<IUser>>(
        `${apiPath}?${queryParams.toString()}`,
        "GET"
    );
};




export const fetchUser = (id: number) =>
    apiRequest<IUser>(`${USERS_API_PATH}/${id}`, "GET");

export const deleteUser = (id: number) =>
    apiRequest<void>(`${USERS_API_PATH}/${id}`, "DELETE");


export const fetchProfile = () =>
    apiRequest<IProfile>(`${PROFILES_API_PATH}/profile/me`, "GET");

export const updateProfile = (data: TUpdateProfileData) => {

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (item instanceof File || item instanceof Blob) {
                    // For file arrays, append without brackets - backend expects 'documents' not 'documents[]'
                    formData.append(key, item);
                } else {
                    formData.append(`${key}[]`, String(item));
                }
            });
        } else if (value instanceof File || value instanceof Blob) {
            formData.append(key, value);
        } else {
            formData.append(key, String(value));
        }
    });

    return apiFileRequest<IMessageResponse>(`${PROFILES_API_PATH}/profile/me`, "PATCH", formData);
}

export const changePassword = (data: TUserResetPasswordData) =>
    apiRequest<IMessageResponse>(`${USERS_API_PATH}/me/reset-password`, "PUT", data);
