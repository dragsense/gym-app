// External Libraries
import axios from 'axios';

// Types
import type { 
  IRole, 
  IPermission, 
  IResource,
  IPaginatedResponse,
  IListQueryParams,
  IMessageResponse 
} from '@shared/interfaces';

// Config
import { config } from '@/config';

const API_BASE = `${config.apiUrl}/roles`;

// Role API functions
export const fetchRoles = async (params: IListQueryParams): Promise<IPaginatedResponse<IRole>> => {
  const response = await axios.get(`${API_BASE}`, { params });
  return response.data;
};

export const fetchRole = async (id: number): Promise<IRole> => {
  const response = await axios.get(`${API_BASE}/${id}`);
  return response.data;
};


export const createRole = async (data: any): Promise<IMessageResponse> => {
  const response = await axios.post(`${API_BASE}`, data);
  return response.data;
};

export const updateRole = async (id: number, data: any): Promise<IMessageResponse> => {
  const response = await axios.put(`${API_BASE}/${id}`, data);
  return response.data;
};

export const deleteRole = async (id: number): Promise<IMessageResponse> => {
  const response = await axios.delete(`${API_BASE}/${id}`);
  return response.data;
};



// Permission API functions
export const fetchPermissions = async (params: IListQueryParams): Promise<IPaginatedResponse<IPermission>> => {
  const response = await axios.get(`${API_BASE}/permissions`, { params });
  return response.data;
};

export const fetchPermissionsByRole = async (roleId: number, params: IListQueryParams): Promise<IPaginatedResponse<IPermission>> => {
  const response = await axios.get(`${API_BASE}/${roleId}/permissions`, { params });
  return response.data;
};

export const fetchPermission = async (id: number): Promise<IPermission> => {
  const response = await axios.get(`${API_BASE}/permissions/${id}`);
  return response.data;
};

export const createPermission = async (data: any): Promise<IMessageResponse> => {
  const response = await axios.post(`${API_BASE}/permissions`, data);
  return response.data;
};

export const updatePermission = async (id: number, data: any): Promise<IMessageResponse> => {
  const response = await axios.put(`${API_BASE}/permissions/${id}`, data);
  return response.data;
};

export const deletePermission = async (id: number): Promise<IMessageResponse> => {
  const response = await axios.delete(`${API_BASE}/permissions/${id}`);
  return response.data;
};

// Resource API functions
export const fetchResources = async (params: IListQueryParams): Promise<IPaginatedResponse<IResource>> => {
  const response = await axios.get(`${API_BASE}/resources`, { params });
  return response.data;
};

export const fetchResource = async (id: number): Promise<IResource> => {
  const response = await axios.get(`${API_BASE}/resources/${id}`);
  return response.data;
};

export const createResource = async (data: any): Promise<IMessageResponse> => {
  const response = await axios.post(`${API_BASE}/resources`, data);
  return response.data;
};

export const updateResource = async (id: number, data: any): Promise<IMessageResponse> => {
  const response = await axios.put(`${API_BASE}/resources/${id}`, data);
  return response.data;
};

export const deleteResource = async (id: number): Promise<IMessageResponse> => {
  const response = await axios.delete(`${API_BASE}/resources/${id}`);
  return response.data;
};
