
import type { User } from "../types/api";

export default function userSearchResultsRender(
  users: User[],
  onSelect: (user: User) => void
): void {
  const container = document.querySelector<HTMLDivElement>(
    "#assign-search-results"
  );

  if (!container) return;

  container.replaceChildren();

  if (users.length === 0) {
    container.textContent = "Nenhum usuário encontrado.";
    return;
  }

  const list = document.createElement("div");
  list.className = "list-group";

  users.forEach((user) => {
    const item = document.createElement("div");
    item.className =
      "list-group-item d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3";

    const details = document.createElement("div");

    const name = document.createElement("strong");
    name.textContent = user.name;

    const email = document.createElement("div");
    email.className = "small text-muted";
    email.textContent = user.email;

    const job = document.createElement("div");
    job.className = "small";
    job.textContent = `Cargo: ${user.job_title ?? "Não informado"}`;

    const location = document.createElement("div");
    location.className = "small";
    location.textContent =
      `Local: ${user.city ?? "Não informada"}/${user.state ?? "—"}`;

    details.append(name, email, job, location);

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "btn btn-sm btn-outline-primary";
    selectButton.textContent = "Escolher";

    selectButton.addEventListener("click", () => {
      onSelect(user);
    });

    item.append(details, selectButton);
    list.append(item);
  });

  container.append(list);
}
