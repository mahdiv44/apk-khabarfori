FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY collector.py ./
RUN useradd --uid 10001 --create-home collector && mkdir /session && chown collector:collector /session
USER collector
ENV PYTHONUNBUFFERED=1
CMD ["python", "collector.py"]
