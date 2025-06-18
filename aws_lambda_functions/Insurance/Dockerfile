FROM public.ecr.aws/lambda/python:3.11
RUN echo "🚀 Building insurance container"
# Install dependencies
RUN pip install --upgrade pip && \
    pip install openai

# Copy code into container
COPY lambda_function.py ${LAMBDA_TASK_ROOT}

# Lambda entrypoint
CMD ["lambda_function.lambda_handler"]
