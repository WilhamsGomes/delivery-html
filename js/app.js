document.addEventListener("DOMContentLoaded", function () {
  const carrinho = [];

  // === FILTRO POR CATEGORIA ===
  const categoryItems = document.querySelectorAll(
    "#categories .categories-items span"
  );
  const cards = document.querySelectorAll("#all-foods .card");

  categoryItems.forEach((item) => {
    item.addEventListener("click", () => {
      categoryItems.forEach((el) => el.classList.remove("category-active"));
      item.classList.add("category-active");

      const selectedCategory = item.getAttribute("data-category");

      cards.forEach((card) => {
        const cardCategory = card.getAttribute("data-category");
        card.style.display =
          selectedCategory === "all" || cardCategory === selectedCategory
            ? "block"
            : "none";
      });
    });
  });

  const showAllBtn = document.querySelector(".header-categories span");
  if (showAllBtn) {
    showAllBtn.addEventListener("click", () => {
      categoryItems.forEach((el) => el.classList.remove("category-active"));
      cards.forEach((card) => (card.style.display = "block"));
    });
  }

  // === LÓGICA DO CARRINHO ===
  function renderBotaoQuantidade(card, quantidade) {
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "quantidade-container";

    const btnMenos = document.createElement("button");
    btnMenos.textContent = "−";
    btnMenos.className = "btn-quantidade";
    btnMenos.onclick = () => {
      const title = card.querySelector(".title").textContent;
      const existingItem = carrinho.find((item) => item.title === title);

      if (existingItem) {
        existingItem.quantidade -= 1;
        if (existingItem.quantidade <= 0) {
          const index = carrinho.findIndex((item) => item.title === title);
          carrinho.splice(index, 1);
        }
      }

      renderCarrinho();
      sincronizarCards();
      atualizarContadorCarrinho();
    };

    const quantidadeSpan = document.createElement("span");
    quantidadeSpan.textContent = quantidade;
    quantidadeSpan.className = "quantidade";

    const btnMais = document.createElement("button");
    btnMais.textContent = "+";
    btnMais.className = "btn-quantidade";
    btnMais.onclick = () => {
      const title = card.querySelector(".title").textContent;
      const price = card.querySelector(".price").textContent;
      const image = card.querySelector("img").getAttribute("src");

      const existingItem = carrinho.find((item) => item.title === title);
      if (existingItem) {
        existingItem.quantidade += 1;
      } else {
        carrinho.push({ title, price, image, quantidade: 1 });
      }

      renderCarrinho();
      sincronizarCards();
      atualizarContadorCarrinho();
    };

    buttonContainer.appendChild(btnMenos);
    buttonContainer.appendChild(quantidadeSpan);
    buttonContainer.appendChild(btnMais);

    return buttonContainer;
  }

  function atualizarCarrinho(card, delta) {
    const title = card.querySelector(".title").textContent;
    const price = card.querySelector(".price").textContent;
    const found = carrinho.find((item) => item.title === title);

    if (found) {
      found.quantidade += delta;
      if (found.quantidade <= 0) {
        const index = carrinho.findIndex((item) => item.title === title);
        carrinho.splice(index, 1);
        restaurarBotaoAdicionar(card);
      } else {
        atualizarBotaoQuantidade(card, found.quantidade);
      }
    }
    console.log("Carrinho:", carrinho);
  }

  function restaurarBotaoAdicionar(card) {
    const content = card.querySelector(".content");
    const btnAtual = content.querySelector(".quantidade-container");
    if (btnAtual) btnAtual.remove();

    const btnAdicionar = document.createElement("button");
    btnAdicionar.className = "add-to-cart";
    btnAdicionar.textContent = "+ Adicionar";
    btnAdicionar.onclick = () => adicionarAoCarrinho(card);

    content.appendChild(btnAdicionar);
  }

  function atualizarBotaoQuantidade(card, quantidade) {
    const content = card.querySelector(".content");
    const btnAtual = content.querySelector(".quantidade-container");
    if (btnAtual) {
      btnAtual.querySelector(".quantidade").textContent = quantidade;
    }
  }

  function adicionarAoCarrinho(card) {
    const title = card.querySelector(".title").textContent;
    const price = card.querySelector(".price").textContent;
    const image = card.querySelector("img").getAttribute("src");

    const existingItem = carrinho.find((item) => item.title === title);

    if (existingItem) {
      existingItem.quantidade += 1;
    } else {
      carrinho.push({ title, price, image, quantidade: 1 });

      const content = card.querySelector(".content");
      const btnAdicionar = content.querySelector(".add-to-cart");
      if (btnAdicionar) btnAdicionar.remove();

      const novoBotao = renderBotaoQuantidade(card, 1);
      content.appendChild(novoBotao);
    }

    renderCarrinho();
    sincronizarCards(); // mantém o cardápio atualizado também
    atualizarContadorCarrinho();
  }

  function renderCarrinho() {
    const container = document.getElementById("cart-items");
    const totalContainer = document.getElementById("cart-total");
    container.innerHTML = "";

    if (carrinho.length === 0) {
      container.innerHTML = "<p>Seu carrinho está vazio.</p>";
      totalContainer.textContent = "R$ 0,00";
      return;
    }

    let subtotal = 0;

    carrinho.forEach((item) => {
      const div = document.createElement("div");
      div.className = "cart-item";

      // Extrai valor numérico
      const valorNumerico = parseFloat(
        item.price.replace("R$", "").replace(",", ".")
      );
      const totalItem = item.quantidade * valorNumerico;
      subtotal += totalItem;

      div.innerHTML = `
        <img src="${item.image}" alt="${item.title}">
        <div class="info">
          <span class="title">${item.title}</span>
          <span class="quantity-price">
            <button class="cart-qty-btn" data-title="${item.title}" data-action="decrease">−</button>
            ${item.quantidade}
            <button class="cart-qty-btn" data-title="${item.title}" data-action="increase">+</button>
            <button class="remove-item" data-title="${item.title}">🗑️</button>
          </span>
          <span class="unit-price">(${item.price} cada)</span>
        </div>
      `;

      container.appendChild(div);
    });

    totalContainer.textContent = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;

    // Eventos dos botões de quantidade
    document.querySelectorAll(".cart-qty-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const title = e.target.getAttribute("data-title");
        const action = e.target.getAttribute("data-action");
        const item = carrinho.find((i) => i.title === title);

        if (item) {
          item.quantidade += action === "increase" ? 1 : -1;
          if (item.quantidade <= 0) {
            const idx = carrinho.findIndex((i) => i.title === title);
            carrinho.splice(idx, 1);
          }
          renderCarrinho();
          sincronizarCards();
        }
      });
    });

    // Remover item
    document.querySelectorAll(".remove-item").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const title = e.target.getAttribute("data-title");
        const index = carrinho.findIndex((i) => i.title === title);
        if (index >= 0) {
          carrinho.splice(index, 1);
          renderCarrinho();
          sincronizarCards();
          atualizarContadorCarrinho();
        }
      });
    });

    atualizarContadorCarrinho();
  }

  function sincronizarCards() {
    document.querySelectorAll("#all-foods .card").forEach((card) => {
      const title = card.querySelector(".title").textContent;
      const content = card.querySelector(".content");
      const carrinhoItem = carrinho.find((item) => item.title === title);

      // Remove botões atuais
      const btnAtual = content.querySelector(".quantidade-container");
      const btnAdicionar = content.querySelector(".add-to-cart");
      if (btnAtual) btnAtual.remove();
      if (btnAdicionar) btnAdicionar.remove();

      if (carrinhoItem) {
        // Se está no carrinho → mostra quantidade
        const novoBotao = renderBotaoQuantidade(card, carrinhoItem.quantidade);
        content.appendChild(novoBotao);
      } else {
        // Se não está → mostra "+ Adicionar"
        const btnAdicionar = document.createElement("button");
        btnAdicionar.className = "add-to-cart";
        btnAdicionar.textContent = "+ Adicionar ao carrinho";
        btnAdicionar.onclick = () => adicionarAoCarrinho(card);
        content.appendChild(btnAdicionar);
      }
    });
  }

  function abrirResumoDoPedido(nome, endereco, pagamento) {
    const container = document.getElementById("resumo-conteudo");
    container.innerHTML = `
      <p><strong>Nome:</strong> ${nome}</p>
      <p><strong>Endereço:</strong> ${endereco}</p>
      <p><strong>Forma de pagamento:</strong> ${pagamento}</p>
      <hr />
      <p><strong>Itens do pedido:</strong></p>
    `;

    let total = 0;

    carrinho.forEach((item) => {
      const valor = parseFloat(item.price.replace("R$", "").replace(",", "."));
      const subtotal = item.quantidade * valor;
      total += subtotal;

      const itemHtml = `<p>${item.quantidade}x ${item.title} — R$ ${subtotal
        .toFixed(2)
        .replace(".", ",")}</p>`;
      container.innerHTML += itemHtml;
    });

    container.innerHTML += `<hr /><p><strong>Total: R$ ${total
      .toFixed(2)
      .replace(".", ",")}</strong></p>`;

    document.getElementById("modal-checkout").classList.remove("open");
    document.getElementById("modal-resumo").classList.add("open");
  }

  function atualizarContadorCarrinho() {
    const contador = document.getElementById("cart-count");
    const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    contador.textContent = totalItens;
  }

  // Vincula eventos nos botões "Adicionar"
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", function () {
      const card = btn.closest(".card");
      adicionarAoCarrinho(card);
    });
  });

  // Abrir carrinho (adicione um botão em algum lugar com id="open-cart")
  document.getElementById("open-cart")?.addEventListener("click", () => {
    document.getElementById("modal-cart").classList.add("open");
  });

  // Fechar carrinho
  document.getElementById("close-cart")?.addEventListener("click", () => {
    document.getElementById("modal-cart").classList.remove("open");
  });

  // Mostrar formulário de pagamento ao clicar em "Finalizar pedido"
  document.getElementById("checkout-button").addEventListener("click", () => {
    document.getElementById("modal-checkout").classList.add("open");
  });

  document.getElementById("close-checkout").addEventListener("click", () => {
    document.getElementById("modal-checkout").classList.remove("open");
  });

  // Mostrar campos de entrega ao escolher forma de pagamento
  document.getElementById("payment-method").addEventListener("change", () => {
    document.getElementById("delivery-fields").style.display = "block";
  });

  document.getElementById("close-resumo").addEventListener("click", () => {
    document.getElementById("modal-resumo").classList.remove("open");
  });

  document.getElementById("voltar-inicio").addEventListener("click", () => {
    document.getElementById("modal-resumo").classList.remove("open");
    document.getElementById("modal-cart").classList.remove("open");
  });

  document
    .getElementById("confirmar-checkout")
    .addEventListener("click", () => {
      const nome = document.getElementById("client-name").value.trim();
      const endereco = document.getElementById("client-address").value.trim();
      const pagamento = document.getElementById("payment-method").value;

      if (!nome || !endereco || !pagamento) {
        alert("Por favor, preencha todos os campos.");
        return;
      }

      abrirResumoDoPedido(nome, endereco, pagamento);
    });

  // ✅ Coloque aqui o listener de confirmação do resumo
  const confirmarResumoBtn = document.getElementById("confirmar-resumo");

  if (confirmarResumoBtn) {
    confirmarResumoBtn.addEventListener("click", () => {
      alert("Pedido confirmado! Obrigado por comprar conosco 😊");

      carrinho.length = 0;
      renderCarrinho();
      sincronizarCards();

      document.getElementById("modal-resumo").classList.remove("open");
      document.getElementById("modal-cart").classList.remove("open");

      document.getElementById("checkout-form").reset();
    });
  }
});

window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (window.scrollY > 10) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});
