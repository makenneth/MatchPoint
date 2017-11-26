defmodule MatchPoints.Utils do
  def generate_session_name(num_chars) do
    :crypto.strong_rand_bytes(num_chars)
    |> Base.url_encode64
  end

  def get_matchpoints_api(url, token) do
    HTTPoison.get!(url, %{}, hackney: [cookie: [{"matchpoint_session", token}]])
  end

  def post_matchpoints_api(url, token, params) do
    HTTPoison.post!(url, Poison.encode!(params), [{"cookie", "matchpoint_session="<>token}, {"Content-Type", "application/json"}])
  end

  def patch_matchpoints_api(url, token, params) do
    HTTPoison.patch!(url, Poison.encode!(params), [{"cookie", "matchpoint_session="<>token}, {"Content-Type", "application/json"}])
  end

  def delete_matchpoints_api(url, token) do
    HTTPoison.delete!(url, %{}, hackney: [cookie: [{"matchpoint_session", token}]])
  end

  def get_session_name(token) do
    HTTPoison.start
    data = get_matchpoints_api("http://127.0.0.1:3000/api/clubs", token)
    |> get_body
    |> Poison.decode!
    case data do
      nil -> {:error, "Unable to get session name"}
      _ -> {:ok, data["club"]["short_id"]}
    end
  end

  def get_player_list(token) do
    HTTPoison.start
    case get_matchpoints_api("http://127.0.0.1:3000/api/my/players", token) do
      %HTTPoison.Response{status_code: 200, body: body} ->
        data = Poison.decode!(body)
        {:ok, data["players"]}
      %HTTPoison.Response{status_code: 500} ->
        {:error, %{players: "Unable to get player list"}}
      %HTTPoison.Error{reason: reason} ->
        IO.inspect reason
        {:error, %{internal_server: "Something had gone wrong..."}}
    end
  end

  def create_player(token, player) do
    HTTPoison.start
    case post_matchpoints_api("http://127.0.0.1:3000/api/my/players", token, %{player: player}) do
      %HTTPoison.Response{status_code: 200, body: body} ->
        data = Poison.decode!(body)
        {:ok, data["player"]}
      %HTTPoison.Response{status_code: 422, body: body} ->
        data = Poison.decode!(body)
        {:error, data["error_description"]}
      %HTTPoison.Response{status_code: _code} -> {:error, %{player: "Something had gone wrong..."}}
      %HTTPoison.Error{reason: reason} ->
        IO.inspect reason
        {:error, %{internal_server: "Something had gone wrong..."}}
    end
  end

  def update_player(token, player) do
    HTTPoison.start
    case patch_matchpoints_api(
      "http://127.0.0.1:3000/api/my/players/#{Integer.to_string(player["id"])}",
      token,
      %{player: player}
    ) do
      %HTTPoison.Response{status_code: 200, body: body} ->
        data = Poison.decode!(body)
        {:ok, data["player"]}
      %HTTPoison.Response{status_code: 422, body: body} ->
        data = Poison.decode!(body)
        {:error, data["error_description"]}
      %HTTPoison.Response{status_code: _code} -> {:error, %{internal_server: "Something had gone wrong..."}}
      %HTTPoison.Error{reason: reason} ->
        IO.inspect reason
        {:error, %{internal_server: "Something had gone wrong..."}}
    end
  end

  def delete_player(token, id) do
    HTTPoison.start
    case delete_matchpoints_api(
      "http://127.0.0.1:3000/api/my/players/#{Integer.to_string(id)}",
      token
    ) do
      %HTTPoison.Response{status_code: 200, body: body} ->
        data = Poison.decode!(body)
        {:ok, data["playerId"]}
      %HTTPoison.Response{status_code: 422, body: body} ->
        data = Poison.decode!(body)
        {:error, data["error_description"]}
      %HTTPoison.Response{status_code: code} ->
        {:error, %{internal_server: "Something had gone wrong..."}}
      %HTTPoison.Error{reason: reason} ->
        IO.inspect reason
        {:error, %{internal_server: "Something had gone wrong..."}}
    end
  end

  def get_body(response) do
    IO.inspect response
    response.body
  end
end
