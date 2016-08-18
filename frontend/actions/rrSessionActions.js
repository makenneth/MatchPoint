import { apiService, apiCSRFService } from "../utils/apiUtil";


export const fetchRRSessions = (id) => {
  apiService({
    url: `/api/clubs/${id}/sessions`,
    success: "fetchedRRSessions"
  })
}
export const fetchSession = (id) => {
  apiService({
    url: "/api/clubs/sessions/" + id,
    success: "fetchedRRSession"
  })
}
export const saveSession = (data, clubId) => {
  apiCSRFService({
    url: "/api/clubs/" + clubId + "/session/new",
    method: "POST",
    data: { session: data },
    success: "fetchedRRSession"
  })
}
export const temporarySession = (data, clubId) => {
  apiCSRFService({
    url: "/api/clubs/" + clubId + "/temp",
    method: "POST",
    data: { session: data },
    success: "log"
  })
}
export const postResult = (clubId, data, ratingUpdateList, id) => {
  debugger;
  apiCSRFService({
    url: `/api/clubs/${clubId}/sessions/${id}`,
    method:"POST",
    data: {
      result: {data, ratingUpdateList}
    },
    success: "fetchedRRSession"
  })
}
export const updateResult = (clubId, data, ratingUpdateList, id, date) => {
  apiCSRFService({
    url: `/api/clubs/${clubId}/sessions/${id}`,
    method:"PATCH",
    data: {
      result: {date, data, ratingUpdateList}
    },
    success: "fetchedRRSession"
  })
}
export const deleteSession = (id) => {
  apiCSRFService({
    url: "/api/clubs/sessions/" + id,
    method: "DELETE",
    success: "deletedRRSession"
  });
}

