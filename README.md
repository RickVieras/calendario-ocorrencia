# Calendário de Ocorrências

Aplicação web em Flask para registrar ocorrências operacionais em um calendário anual de 12 meses.

## Executar no computador

```bash
pip install -r requirements.txt
python app.py
```

Abra `http://127.0.0.1:5000` no navegador.

## Publicar online

No Render ou Railway, envie esta pasta para um repositório GitHub e configure:

- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`

Antes da publicação, altere a `SECRET_KEY` no arquivo `app.py`. Os registros são salvos no arquivo `ocorrencias.db`. Para uma publicação permanente, utilize um banco PostgreSQL/SQLite com disco persistente, pois alguns serviços reiniciam e apagam arquivos locais.
