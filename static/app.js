const nomesMeses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const nomesDias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const calendario = document.querySelector('#calendario');
const ano = Number(calendario.dataset.ano);
const registros = JSON.parse(calendario.dataset.ocorrencias);
const porDia = registros.reduce((mapa, r) => ((mapa[r.data] ||= []).push(r), mapa), {});
const esc = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

for (let mes = 0; mes < 12; mes++) {
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  let html = `<article class="mes"><h2>${nomesMeses[mes]}</h2><div class="dias-semana">${nomesDias.map(d => `<span>${d}</span>`).join('')}</div><div class="grade">`;
  html += '<span class="vazio"></span>'.repeat(primeiroDia);
  for (let dia = 1; dia <= totalDias; dia++) {
    const data = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
    const itens = porDia[data] || [];
    html += `<button class="dia ${itens.length ? 'tem-ocorrencia' : ''}" data-data="${data}"><b>${dia}</b>${itens.slice(0,2).map(i => `<span class="marcador ${i.categoria.toLowerCase()}">${esc(i.titulo)}</span>`).join('')}${itens.length > 2 ? `<small>+${itens.length - 2} registros</small>` : ''}</button>`;
  }
  calendario.insertAdjacentHTML('beforeend', html + '</div></article>');
}

const modal = document.querySelector('#modal');
document.querySelector('#abrir-modal').onclick = () => { document.querySelector('#campo-data').value = `${ano}-01-01`; modal.showModal(); };
document.querySelector('#fechar-modal').onclick = () => modal.close();
document.querySelectorAll('.dia').forEach(botao => botao.onclick = () => {
  const data = botao.dataset.data, itens = porDia[data] || [];
  if (!itens.length) { document.querySelector('#campo-data').value = data; modal.showModal(); return; }
  const detalhes = document.querySelector('#conteudo-detalhes');
  detalhes.innerHTML = `<div class="modal-topo"><div><p class="eyebrow">${new Date(data+'T12:00').toLocaleDateString('pt-BR', {dateStyle:'long'})}</p><h2>Ocorrências do dia</h2></div><button class="fechar" type="button">×</button></div>${itens.map(i => `<div class="item-detalhe"><span class="tag ${i.categoria.toLowerCase()}">${esc(i.categoria)}</span><h3>${esc(i.titulo)}</h3><p>${esc(i.descricao) || 'Sem observações adicionais.'}</p><form method="post" action="/ocorrencias/${i.id}/excluir"><input type="hidden" name="ano" value="${ano}"><button class="excluir">Excluir</button></form></div>`).join('')}<button class="secundario adicionar-neste-dia" type="button">+ Adicionar outra</button>`;
  const dm = document.querySelector('#modal-detalhes'); dm.showModal();
  detalhes.querySelector('.fechar').onclick = () => dm.close();
  detalhes.querySelector('.adicionar-neste-dia').onclick = () => { dm.close(); document.querySelector('#campo-data').value = data; modal.showModal(); };
});
