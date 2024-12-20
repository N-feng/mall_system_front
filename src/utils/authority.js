/**
 * 按钮权限
 */
export function getBusinessCustomerPermissions(currentUser) {
  const { permissions, is_admin } = currentUser;
  return {
    add: is_admin || permissions?.includes('301_001'),
    delete: is_admin || permissions?.includes('301_002'),
    modify: is_admin || permissions?.includes('301_003'),
    find: is_admin || permissions?.includes('301_004'),
    activate: is_admin || permissions?.includes('301_005'), // 客户状态切换
  };
}
export function getBusinessVisitPermissions(currentUser) {
  const { permissions, is_admin } = currentUser;
  return {
    add: is_admin || permissions?.includes('303_001'),
    delete: is_admin || permissions?.includes('303_002'),
    modify: is_admin || permissions?.includes('303_003'),
    find: is_admin || permissions?.includes('303_004'),
  };
}
export function getBusinessIntentionsPermissions(currentUser) {
  const { permissions, is_admin } = currentUser;
  return {
    add: is_admin || permissions?.includes('302_001'),
    delete: is_admin || permissions?.includes('302_002'),
    modify: is_admin || permissions?.includes('302_003'),
    find: is_admin || permissions?.includes('302_004'),
  };
}

export function getBusinessAuditPermissions(currentUser) {
  const { permissions, is_admin } = currentUser;
  return {
    add: is_admin || permissions?.includes('308_001'),
    delete: is_admin || permissions?.includes('308_002'),
    modify: is_admin || permissions?.includes('308_003'),
    find: is_admin || permissions?.includes('308_004'),
  };
}
