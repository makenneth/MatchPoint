defmodule MatchPoints.UserController do
  use MatchPoints.Web, :controller

  def create(conn, params) do
    identifier = params.club_id
    player_id = params.player_id
    case MatchPoints.SessionRegistry.whereis_name(identifier) do
      :undefined ->
        render conn, success: false, error: %{session: "No sessions are in progress"}
      _ ->
        MatchPoints.Server.register_player(identifier, player_id)
        render conn, success: true, error: nil
    end
  end
end
