FROM nginx:alpine

COPY . /usr/share/nginx/html

RUN rm -rf /usr/share/nginx/html/.git \
           /usr/share/nginx/html/.runtime \
           /usr/share/nginx/html/docs

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
