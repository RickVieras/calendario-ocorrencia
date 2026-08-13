from datetime import date, datetime
from pathlib import Path
import sqlite3

from flask import Flask, flash, redirect, render_template, request, url_for

BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "ocorrencias.db"

app = Flask(__name__)
app.config["SECRET_KEY"] = "altere-esta-chave-antes-de-publicar"


def db():
    conexao = sqlite3.connect(DATABASE)
    conexao.row_factory = sqlite3.Row
    return conexao


def iniciar_banco():
    with db() as conexao:
        conexao.execute("""
            CREATE TABLE IF NOT EXISTS ocorrencias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                data TEXT NOT NULL,
                titulo TEXT NOT NULL,
                descricao TEXT,
                categoria TEXT NOT NULL DEFAULT 'Operacional',
                criado_em TEXT NOT NULL
            )
        """)


iniciar_banco()


@app.route("/")
def inicio():
    ano = request.args.get("ano", date.today().year, type=int)
    with db() as conexao:
        registros = conexao.execute(
            "SELECT * FROM ocorrencias WHERE substr(data, 1, 4) = ? ORDER BY data, id",
            (str(ano),),
        ).fetchall()
    ocorrencias = [dict(r) for r in registros]
    return render_template("index.html", ano=ano, ocorrencias=ocorrencias)


@app.route("/ocorrencias", methods=["POST"])
def adicionar_ocorrencia():
    data_ocorrencia = request.form.get("data", "").strip()
    titulo = request.form.get("titulo", "").strip()
    descricao = request.form.get("descricao", "").strip()
    categoria = request.form.get("categoria", "Operacional")

    try:
        datetime.strptime(data_ocorrencia, "%Y-%m-%d")
    except ValueError:
        flash("Informe uma data válida.", "erro")
        return redirect(url_for("inicio"))

    if not titulo:
        flash("Informe um título para a ocorrência.", "erro")
        return redirect(url_for("inicio", ano=data_ocorrencia[:4]))

    with db() as conexao:
        conexao.execute(
            "INSERT INTO ocorrencias (data, titulo, descricao, categoria, criado_em) VALUES (?, ?, ?, ?, ?)",
            (data_ocorrencia, titulo, descricao, categoria, datetime.now().isoformat(timespec="seconds")),
        )
    flash("Ocorrência salva no calendário.", "sucesso")
    return redirect(url_for("inicio", ano=data_ocorrencia[:4]))


@app.route("/ocorrencias/<int:ocorrencia_id>/excluir", methods=["POST"])
def excluir_ocorrencia(ocorrencia_id):
    ano = request.form.get("ano", date.today().year)
    with db() as conexao:
        conexao.execute("DELETE FROM ocorrencias WHERE id = ?", (ocorrencia_id,))
    flash("Ocorrência excluída.", "sucesso")
    return redirect(url_for("inicio", ano=ano))


if __name__ == "__main__":
    app.run(debug=True)
