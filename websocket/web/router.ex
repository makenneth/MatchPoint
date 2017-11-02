defmodule MatchPoints.Router do
  use MatchPoints.Web, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", MatchPoints do
    pipe_through :api

    post "/user", UserController, :create

  end
end
