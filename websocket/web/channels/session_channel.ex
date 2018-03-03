defmodule MatchPoints.SessionChannel do
  use MatchPoints.Web, :channel

  alias MatchPoints.Supervisor
  alias MatchPoints.Server

  def join("session:" <> id, _payload, socket) do
    case Supervisor.initialize_if_havent(socket.assigns.session_name, socket.assigns.session_token) do
      {:ok, state} ->
        send self(), {:after_join, state}
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

  def handle_in("UNREGISTER_PLAYER", %{"id" => id}, socket) do
    %{session_name: session_name} = socket.assigns
    affected = Server.unregister_player(session_name, id)
    broadcast! socket, "PLAYER_UNREGISTERED", %{id: affected}
    {:noreply, socket}
  end

  def handle_in("REGISTER_PLAYER", %{"id" => id}, socket) do
    %{session_name: session_name} = socket.assigns
    affected = Server.register_player(session_name, id)
    broadcast! socket, "PLAYER_REGISTERED", %{id: affected}
    {:noreply, socket}
  end

  def handle_in("REGISTER_PLAYER", _data, socket) do
    {:noreply, socket}
  end
  def handle_in("CREATE_PLAYER", %{"player" => player, "add_after_success" => should_add}, socket) do
    %{session_name: session_name, session_token: session_token} = socket.assigns
    case MatchPoints.Utils.create_player(session_token, player) do
      {:error, error} ->
        broadcast! socket, "CREATE_PLAYER_FAILURE", %{error_description: error}
      {:ok, data} ->
        Server.create_player(session_name, data, should_add)
        broadcast! socket, "CREATE_PLAYER_SUCCESS", %{player: data, shouldAdd: should_add}
    end
    {:noreply, socket}
  end

  def handle_in("CREATE_PLAYER", _data, socket) do
    {:noreply, socket}
  end

  def handle_in("UPDATE_PLAYER", %{"player" => player}, socket) do
    %{session_name: session_name, session_token: session_token} = socket.assigns
    case MatchPoints.Utils.update_player(session_token, player) do
      {:error, error} ->
        broadcast! socket, "UPDATE_PLAYER_FAILURE", %{error_description: error}
      {:ok, data} ->
        Server.update_player(session_name, data)
        broadcast! socket, "UPDATE_PLAYER_SUCCESS", %{player: data}
    end
    {:noreply, socket}
  end

  def handle_in("UPDATE_PLAYER", _data, socket) do
    {:noreply, socket}
  end

  def handle_in("DELETE_PLAYER", %{"id" => id}, socket) do
    %{session_name: session_name, session_token: session_token} = socket.assigns
    case MatchPoints.Utils.delete_player(session_token, id) do
      {:error, error} ->
        broadcast! socket, "DELETE_PLAYER_FAILURE", %{error_description: error}
      {:ok, data} ->
        Server.delete_player(session_name, data)
        broadcast! socket, "DELETE_PLAYER_SUCCESS", %{id: id}
    end
    {:noreply, socket}
  end

  def handle_in("DELETE_PLAYER", _data, socket) do
    {:noreply, socket}
  end

  def handle_in("END_SESSION", _data, socket) do
    %{session_name: session_name} = socket.assigns
    MatchPoints.SessionRegistry.unregister_name(session_name)
    broadcast! socket, "SESSION_ENDED", %{}
    {:noreply, socket}
  end

  def handle_in(_type, _data, socket) do
    {:noreply, socket}
  end
end
