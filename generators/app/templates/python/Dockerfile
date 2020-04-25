FROM python:3.7.4-slim as python-base

## Adding environmentment variables that could be used in both build stage and deploy stage
ENV POETRY_PATH=/opt/poetry \
    VENV_PATH=/opt/venv 
ENV PATH="$POETRY_PATH/bin:$VENV_PATH/bin:$PATH"

## BUILD STAGE
FROM python-base as build-stage

COPY poetry.lock pyproject.toml ./

RUN apt-get update \
    && apt-get install --no-install-recommends -y curl build-essential \
    # install poetry 
    && curl -sSL https://raw.githubusercontent.com/sdispater/poetry/master/get-poetry.py | python \
    && mv /root/.poetry $POETRY_PATH \
    && poetry --version \
    # configure poetry & make a virtualenv ahead of time since we only need one
    && python -m venv $VENV_PATH \
    && poetry config virtualenvs.create false \
    && poetry install --no-dev \
    && pip uninstall --yes poetry \
    # cleanup
    && rm -rf /var/lib/apt/lists/*

## DEPLOY STAGE
FROM python-base as production-stage

WORKDIR /app

COPY --from=build-stage $VENV_PATH $VENV_PATH
COPY . ./

CMD ["python", "/app/src/main.py", "9080"]
