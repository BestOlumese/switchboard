# Concern — Demo-day failures

| Failure | Prevention / fallback |
|---------|-----------------------|
| Venue Wi-Fi dies | Phone hotspot; offline local Docker stack with mock-kora; recorded video |
| Neon cold start | Health ping 10 min before |
| WhatsApp token expired | Permanent System User token, checked night before |
| Judge's number not whitelisted | Add night before; team phone as backup |
| Kora sandbox slow | Live booking uses sandbox credit API we trigger ourselves; chaos uses mock-kora |
| LLM provider outage | `LLM_PROVIDER` switch to a second provider, tested the day before |
| Bad deploy | `main` frozen 24h before; Vercel instant rollback to previous prod deployment |
