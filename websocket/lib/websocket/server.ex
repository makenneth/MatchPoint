defmodule MatchPoints.Server do
  use GenServer

  def start_link(name) do
    GenServer.start_link(__MODULE__, %{players: %{}, added_players: []}, name: via_tuple(name))
  end

  def set_players(session_name, players) do
    GenServer.cast(via_tuple(session_name), {:set_players, players})
  end

  def get_initial_state(session_name) do
    GenServer.call(via_tuple(session_name), :get_initial_state)
  end

  def register_player(session_name, playerId) do
    GenServer.cast(via_tuple(session_name), {:register_player, playerId})
  end

  def unregister_player(session_name, playerId) do
    GenServer.cast(via_tuple(session_name), {:unregister_player, playerId})
  end

  def create_player(session_name, player, shouldAdd) do
    GenServer.call(via_tuple(session_name), {:create_player, player, shouldAdd})
  end

  def update_player(session_name, player) do
    GenServer.call(via_tuple(session_name), {:update_player, player})
  end

  def delete_player(session_name, playerId) do
    GenServer.call(via_tuple(session_name), {:delete_player, playerId})
  end

  defp via_tuple(name) do
    {:via, MatchPoints.SessionRegistry, {:session, name}}
  end

  def init(messages) do
    {:ok, messages}
  end

  def handle_cast({:set_players, players}, state) do
    map = Enum.reduce(players, %{}, fn x, acc -> Map.put(acc, x["id"], x) end)
    {:noreply, Map.put(state, :players, map)}
  end

  def handle_cast({:register_player, id}, state) do
    player = Map.get(state, id)
    {:noreply, Map.put(state, :addedPlayers, state ++ [player])}
  end

  def handle_cast({:unregister_player, id}, state) do
    added_players = Enum.reject(state.added_players, fn(p) -> p["id"] == id end)
    {:noreply, Map.put(state, :addedPlayers, added_players)}
  end

  def handle_call({:create_player, player, should_add}, state) do
    players =
      Map.get(state, :players)
      |>Map.put(player.id, player)
    updated_state = state
      |> Map.put(:players, players)
      |> update_if_should_add(player, should_add)
    {:reply, player, updated_state}
  end

  def handle_call({:update_player, player}, state) do
    players = Map.get(state, :players) |> Map.put(player.id, player)
    added_players = Map.get(state, :added_players)
      |> Enum.map(fn p -> if p.id == player, do: player, else: p end)
    updated_state = state
      |> Map.put(:players, players)
      |> Map.put(:added_players, added_players)
    {:reply, player, updated_state}
  end

  def handle_call({:delete_player, playerId}, state) do
    players = Map.get(state, :players) |> Map.delete(playerId)
    added_players = Map.get(state, :added_players)
      |> Enum.reject(fn p -> p.id == playerId end)
    updated_state = state
      |> Map.put(:players, players)
      |> Map.put(:added_players, added_players)
    {:reply, playerId, updated_state}
  end

  def handle_call(:get_initial_state, _from, state) do
    {:reply, state, state}
  end

  defp update_if_should_add(state, player, should_add) do
    if should_add do
      added_players = Map.get(state, :added_players)
      Map.put(state, :added_players, added_players ++ [player])
    else
      state
    end
  end
end
