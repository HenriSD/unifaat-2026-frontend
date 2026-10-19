
import type { User, UserSearchFilters } from "../types/api";
import { userSearchApi } from "../api/userSearchApi";
import { taskCreateApi } from "../api/taskCreateApi";
import userSearchResultsRender from "../render/userSearchResultsRender";
import tasksListRender from "../render/tasksListRender";
import { getUserId } from "../utils/getUserIdFromAuth";

export default function assignTaskModalListeners(): void {
  const modal = document.querySelector<HTMLDivElement>(
    "#assign-task-modal"
  );
  const taskNameInput = document.querySelector<HTMLInputElement>(
    "#assign-task-name"
  );
  const searchField = document.querySelector<HTMLSelectElement>(
    "#assign-search-field"
  );
  const searchValue = document.querySelector<HTMLInputElement>(
    "#assign-search-value"
  );
  const searchButton = document.querySelector<HTMLButtonElement>(
    "#assign-search-btn"
  );
  const resultsContainer = document.querySelector<HTMLDivElement>(
    "#assign-search-results"
  );
  const selectedUserContainer = document.querySelector<HTMLDivElement>(
    "#assign-selected-user"
  );
  const submitButton = document.querySelector<HTMLButtonElement>(
    "#assign-task-submit"
  );
  const cancelButton = document.querySelector<HTMLButtonElement>(
    "#assign-task-cancel"
  );
  const messageContainer = document.querySelector<HTMLDivElement>(
    "#assign-task-message"
  );

  if (
    !modal ||
    !taskNameInput ||
    !searchField ||
    !searchValue ||
    !searchButton ||
    !resultsContainer ||
    !selectedUserContainer ||
    !submitButton ||
    !cancelButton ||
    !messageContainer
  ) {
    console.error("Não foi possível inicializar o modal de atribuição.");
    return;
  }

  let selectedUser: User | null = null;
  let isSearching = false;
  let isCreating = false;

  function showMessage(message: string, type: "success" | "danger" | "warning"): void {
    messageContainer.textContent = message;
    messageContainer.className = `alert alert-${type}`;
  }

  function clearMessage(): void {
    messageContainer.textContent = "";
    messageContainer.className = "alert d-none";
  }

  function resetModal(): void {
    taskNameInput.value = "";
    searchValue.value = "";
    searchField.value = "name";
    resultsContainer.replaceChildren();
    selectedUser = null;
    selectedUserContainer.textContent = "Nenhum usuário selecionado.";
    selectedUserContainer.className = "alert alert-secondary";
    clearMessage();
    searchButton.disabled = false;
    submitButton.disabled = false;
    selectedUserContainer.removeAttribute("data-user-id");
  }

  function buildFilters(value: string): UserSearchFilters {
    const field = searchField.value;
    const filters: UserSearchFilters = {};

    switch (field) {
      case "name":
        filters.name = value;
        break;
      case "email":
        filters.email = value;
        break;
      case "job_title":
        filters.job_title = value;
        break;
      case "city":
        filters.city = value;
        break;
      case "state":
        filters.state = value;
        break;
      case "bio":
        filters.bio = value;
        break;
    }

    return filters;
  }

  async function searchUsers(): Promise<void> {
    if (isSearching) return;

    const value = searchValue.value.trim();

    if (!value) {
      showMessage("Digite algo para buscar um usuário.", "warning");
      searchValue.focus();
      return;
    }

    clearMessage();
    isSearching = true;
    searchButton.disabled = true;
    resultsContainer.textContent = "Buscando usuários...";

    try {
      const response = await userSearchApi(buildFilters(value), 1, 10);

      userSearchResultsRender(response.data, (user) => {
        selectedUser = user;
        selectedUserContainer.textContent =
          `Atribuir para: ${user.name} (${user.email})`;
        selectedUserContainer.className = "alert alert-info";
        selectedUserContainer.dataset.userId = String(user.id);
        clearMessage();
      });

      const totalMessage = document.createElement("p");
      totalMessage.className = "small text-muted mt-2";
      totalMessage.textContent =
        `${response.total} ${response.total === 1 ? "usuário encontrado" : "usuários encontrados"}`;

      resultsContainer.prepend(totalMessage);

      if (response.total === 0) {
        showMessage("Nenhum usuário encontrado.", "warning");
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      resultsContainer.replaceChildren();
      showMessage(
        "Não foi possível buscar usuários. Verifique sua conexão e tente novamente.",
        "danger"
      );
    } finally {
      isSearching = false;
      searchButton.disabled = false;
    }
  }

  searchButton.addEventListener("click", () => {
    void searchUsers();
  });

  searchValue.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    void searchUsers();
  });

  searchField.addEventListener("change", () => {
    resultsContainer.replaceChildren();
    clearMessage();
  });

  searchValue.addEventListener("input", () => {
    resultsContainer.replaceChildren();
    clearMessage();
  });

  submitButton.addEventListener("click", async () => {
    if (isCreating) return;

    const name = taskNameInput.value.trim();

    if (!name) {
      showMessage("Digite o nome da tarefa.", "warning");
      taskNameInput.focus();
      return;
    }

    if (!selectedUser) {
      showMessage("Busque e escolha um usuário antes de criar a tarefa.", "warning");
      return;
    }

    isCreating = true;
    submitButton.disabled = true;
    cancelButton.disabled = true;
    clearMessage();

    const targetUser = selectedUser;

    try {
      await taskCreateApi(targetUser.id, { name });

      const loggedUserId = getUserId();

      if (loggedUserId === targetUser.id) {
        try {
          await tasksListRender(loggedUserId);
        } catch (error) {
          console.error("Tarefa criada, mas não foi possível atualizar a lista:", error);
        }
      }

      resetModal();

      const bootstrap = await import("bootstrap");
      const Modal = bootstrap.Modal;
      const modalInstance = Modal.getInstance(modal);

      if (modalInstance) {
        modalInstance.hide();
      }

      window.alert(`Tarefa criada para ${targetUser.name}.`);
    } catch (error) {
      console.error("Erro ao criar tarefa atribuída:", error);
      showMessage(
        "Não foi possível criar a tarefa. Tente novamente.",
        "danger"
      );
    } finally {
      isCreating = false;
      submitButton.disabled = false;
      cancelButton.disabled = false;
    }
  });

  modal.addEventListener("hidden.bs.modal", () => {
    resetModal();
  });
}
