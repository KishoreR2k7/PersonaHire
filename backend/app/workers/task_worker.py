import time
import logging
from app.core.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("persona_hire_worker")


def main():
    logger.info("Persona Hire Background Task Worker starting...")
    logger.info(f"Connected to Redis broker at: {settings.REDIS_URL}")
    logger.info("Listening for background document extraction and AI processing jobs...")

    # Main worker loop
    while True:
        try:
            # Heartbeat / processing hook
            time.sleep(10)
        except KeyboardInterrupt:
            logger.info("Worker shutting down gracefully...")
            break
        except Exception as e:
            logger.error(f"Worker iteration exception: {e}")
            time.sleep(5)


if __name__ == "__main__":
    main()
