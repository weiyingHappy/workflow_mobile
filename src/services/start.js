
import request from '../utils/request';

// 可发起的流程
export function getFlowList() {
  return request('/api/list');
}
// 获取发起流程
export function getStartFlow(id) {
  return request(`/api/start/${id}`);
}

// 上传图片
export function fileUpload(data) {
  return request(`${UPLOAD_PATH}/api/files`, {
    method: 'POST',
    body: data,
  });
}
// 法强1列表
export function getStartList(data) {
  return request('/api/sponsor', {
    method: 'GET',
    body: data,
  });
}

// 预提交
export function preSet(data) {
  return request(`/api/preset/${data.id}`, {
    method: 'POST',
    body: data.data,
  });
}

export function stepStart(data) {
  return request(`/api/start/${data.id}`, {
    method: 'POST',
    body: data.data,
  });
}

// 发起详情
export function startDetail(id) {
  return request(`/api/sponsor/${id}`);
}

export function doWithdraw(data) {
  return request('/api/withdraw', {
    method: 'PATCH',
    body: data,
  });
}

export async function getUserInfo() {
  return request('/api/oa/current-user');
}
