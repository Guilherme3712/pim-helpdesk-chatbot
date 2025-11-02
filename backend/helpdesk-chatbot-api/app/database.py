# app/db/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 🔧 Substitua usuário e senha pelos do seu MySQL
DATABASE_URL = "mysql+pymysql://root:admin@localhost:3306/db_suporte_ia"

# Cria engine e sessão
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependência de sessão (para injeção em rotas FastAPI)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
