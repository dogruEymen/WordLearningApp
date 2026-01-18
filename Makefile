# Word Learning App - Makefile
# Docker ile kolay yönetim için

.PHONY: help build up down logs restart clean setup pull-model

# Varsayılan hedef
help:
	@echo "Word Learning App - Docker Yönetim Komutları"
	@echo ""
	@echo "Kullanım:"
	@echo "  make setup      - İlk kurulum (build + up + pull-model)"
	@echo "  make build      - Docker image'larını derle"
	@echo "  make up         - Tüm servisleri başlat"
	@echo "  make down       - Tüm servisleri durdur"
	@echo "  make restart    - Servisleri yeniden başlat"
	@echo "  make logs       - Tüm servislerin loglarını göster"
	@echo "  make logs-backend   - Backend loglarını göster"
	@echo "  make logs-python    - Python servis loglarını göster"
	@echo "  make pull-model     - Ollama modeli indir (llama3.1:8b)"
	@echo "  make clean      - Tüm container, volume ve image'ları temizle"
	@echo "  make status     - Servislerin durumunu göster"
	@echo ""

# İlk kurulum
setup: build up
	@echo "Ollama modeli indiriliyor (bu biraz zaman alabilir)..."
	@sleep 30
	$(MAKE) pull-model
	@echo ""
	@echo "✅ Kurulum tamamlandı!"
	@echo ""
	@echo "Servisler:"
	@echo "  - Backend API: http://localhost:8080"
	@echo "  - Python Service: http://localhost:8000"
	@echo "  - PostgreSQL: localhost:5432"
	@echo "  - Ollama: http://localhost:11434"
	@echo ""

# Docker image'larını derle
build:
	@echo "Docker image'ları derleniyor..."
	docker compose build

# Servisleri başlat
up:
	@echo "Servisler başlatılıyor..."
	docker compose up -d
	@echo ""
	@echo "Servisler başlatıldı. Logları görmek için: make logs"

# Servisleri durdur
down:
	@echo "Servisler durduruluyor..."
	docker compose down

# Servisleri yeniden başlat
restart: down up

# Tüm logları göster
logs:
	docker compose logs -f

# Backend logları
logs-backend:
	docker compose logs -f backend

# Python servis logları
logs-python:
	docker compose logs -f python-service

# Ollama logları
logs-ollama:
	docker compose logs -f ollama

# PostgreSQL logları
logs-db:
	docker compose logs -f postgres

# Ollama modeli indir
pull-model:
	@echo "Ollama llama3.1:8b modeli indiriliyor..."
	docker compose exec ollama ollama pull llama3.1:8b
	@echo "Model indirildi!"

# Servis durumlarını göster
status:
	@echo "Servis durumları:"
	@docker compose ps

# Her şeyi temizle
clean:
	@echo "Tüm container, volume ve image'lar temizleniyor..."
	docker compose down -v --rmi all
	@echo "Temizlik tamamlandı!"

# Sadece container'ları durdur (volume'ları koru)
stop:
	docker compose stop

# Health check
health:
	@echo "Backend health check:"
	@curl -s http://localhost:8080/auth/health | jq . || echo "Backend erişilemez"
	@echo ""
	@echo "Python service health check:"
	@curl -s http://localhost:8000/health | jq . || echo "Python service erişilemez"
	@echo ""
	@echo "Ollama health check:"
	@curl -s http://localhost:11434/api/tags | jq . || echo "Ollama erişilemez"

# Veritabanına bağlan
db-shell:
	docker compose exec postgres psql -U postgres -d wordlearn

# Backend shell
backend-shell:
	docker compose exec backend sh
