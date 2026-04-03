# 基础镜像：使用官方的 Nginx 轻量级镜像
FROM nginx:alpine

# 将打包好的静态文件复制到 Nginx 的默认静态资源目录
COPY dist/ /usr/share/nginx/html/

# （可选但推荐）复制自定义的 Nginx 配置文件，用于处理前端路由和反向代理
# 如果你的项目不需要特殊配置，可以删除这一步
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 Nginx 的默认端口（通常是 80）
EXPOSE 80

# 启动 Nginx 服务
CMD ["nginx", "-g", "daemon off;"]