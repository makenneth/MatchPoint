defmodule MatchPoints.Utils do
  def generate_session_name(num_chars) do
    :crypto.strong_rand_bytes(num_chars)
    |> Base.url_encode64
  end

  def get_matchpoints_api(url, token) do
    HTTPoison.get!(url, %{}, hackney: [cookie: [{"matchpoint_session", token}]])
  end

  def get_session_name(token) do
    HTTPoison.start
    data = get_matchpoints_api("http://127.0.0.1:3000/api/clubs", token)
    |> get_body
    |> Poison.decode!
    case data do
      {:ok, club} -> {:ok, club["_id"]}
      {_} -> {:error, _}
    end
  end

  def get_player_list(token) do
    HTTPoison.start
    data = get_matchpoints_api("http://127.0.0.1:3000/api/my/players", token)
    |> get_body
    |> Poison.decode!
    case data do
      {:ok, players} -> {:ok, players}
      {_} -> {:error, _}
    end
  end


  def get_body(response) do
    response.body
  end
end
