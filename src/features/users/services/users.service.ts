import {
  getAllUsersApi,
  searchUsersApi,
  banUserApi,
  unbanUserApi,
  updateProfileApi,
  uploadAvatarApi,
} from "../api/users.api";
import { UpdateProfileRequest } from "../api/request/users.request";

export const getAllUsersService = async (page = 0) => {
  return await getAllUsersApi(page);
};

export const searchUsersService = async (query: string, page = 0) => {
  return await searchUsersApi(query, page);
};

export const banUserService = async (id: number) => {
  return await banUserApi(id);
};

export const unbanUserService = async (id: number) => {
  return await unbanUserApi(id);
};

export const updateProfileService = async (data: UpdateProfileRequest) => {
  return await updateProfileApi(data);
};

export const uploadAvatarService = async (file: File) => {
  return await uploadAvatarApi(file);
};
