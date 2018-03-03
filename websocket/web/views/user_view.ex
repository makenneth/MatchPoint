defmodule MatchPoints.UserView do
  use MatchPoints.Web, :view

  def render("create.json", %{success: success, error: error}) do
    case success do
      true -> %{success: true}
      false -> error
    end
  end
end
