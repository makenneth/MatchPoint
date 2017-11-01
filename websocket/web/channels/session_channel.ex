defmodule MatchPoints.SessionChannel do
  use MatchPoints.Web, :channel

  alias MatchPoints.Supervisor
  alias MatchPoints.Server

  def join("session:" <> _id, _payload, socket) do
    case Supervisor.initialize_if_havent(socket.assigns.session_name, socket.assigns.session_token) do
      {:ok, state} ->
        send self, {:after_join, state}
        {:ok, socket}
      {:error, _} ->
        {:error, %{reason: "Unable to verify user."}}
    end
  end

  def terminate(_reason, _socket) do
    :ok
  end

  def handle_info({:after_join, state}, socket) do
    push socket, "INITIAL_STATE", state
    {:noreply, socket}
  end

  def handle_in("UNREGISTER_PLAYER", %{id: id}, socket) do
    %{session_name: session_name} = socket.assigns
    Server.unregister_player(session_name, id)
    broadcast! socket, "PLAYER_UNREGISTERED", %{id: id}
    {:noreply, socket}
  end

  def handle_in("REGISTER_PLAYER", %{id: id}, socket) do
    %{session_name: session_name} = socket.assigns
    Server.register_player(session_name, id)
    broadcast! socket, "PLAYER_REGISTERED", %{id: id}
    {:noreply, socket}
  end

  def handle_in("CREATE_PLAYER", %{player: player, add_after_success: should_add}, socket) do
    %{session_name: session_name, session_token: session_token} = socket.assigns
    case MatchPoints.Utils.create_player(session_token, player)
      {:error, error} ->
        broadcast! socket, "ERROR_OCCURED", %{error: error}
      {:ok, data} ->
        Server.create_player(session_name, data, should_add)
        broadcast! socket, "PLAYER_CREATED", %{player: data}
    end
    {:noreply, socket}
  end

  def handle_in("UPDATE_PLAYER", %{player: player}, socket) do
    %{session_name: session_name, session_token: session_token} = socket.assigns
    case MatchPoints.Utils.update_player(socket.assigns.session_token, player)
      {:error, error} ->
        broadcast! socket, "ERROR_OCCURED", %{error: error}
      {:ok, data} ->
        Server.update_player(session_name, data)
        broadcast! socket, "PLAYER_UPDATED", %{player: data}
    end
    {:noreply, socket}
  end

  def handle_in("DELETE_PLAYER", %{playerId: playerId}, socket) do
    %{session_name: session_name} = socket.assigns
    case MatchPoints.Utils.update_player(socket.assigns.session_token, playerId)
      {:error, error} ->
        broadcast! socket, "ERROR_OCCURED", %{error: error}
      {:ok, data} ->
        Server.delete_player(session_name, data)
        broadcast! socket, "PLAYER_DELETED", %{playerId: playerId}
    end
    {:noreply, socket}
  end

  # def handle_out("user_registered", data, socket) do
  #   push socket, "user_registered", data
  #   {:noreply, socket}
  # end

  # def handle_out("user_unregistered", data, socket) do
  #   push socket, "user_unregistered", data
  #   {:noreply, socket}
  # end
end
