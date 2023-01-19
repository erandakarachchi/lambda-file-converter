FROM public.ecr.aws/shelf/lambda-libreoffice-base:7.4-node16-x86_64

COPY ./ ${LAMBDA_TASK_ROOT}/

RUN npm install

# You can overwrite command in `serverless.yml` template
CMD ["app.convertFile"]
