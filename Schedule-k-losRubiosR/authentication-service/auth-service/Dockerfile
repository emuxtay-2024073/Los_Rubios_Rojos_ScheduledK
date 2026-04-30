FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY authentication-service/auth-service/src/AuthService.Api/AuthService.Api.csproj AuthService.Api/
COPY authentication-service/auth-service/src/AuthService.Application/AuthService.Application.csproj AuthService.Application/
COPY authentication-service/auth-service/src/AuthService.Domain/AuthService.Domain.csproj AuthService.Domain/
COPY authentication-service/auth-service/src/AuthService.Persistence/AuthService.Persistence.csproj AuthService.Persistence/

RUN dotnet restore AuthService.Api/AuthService.Api.csproj

COPY authentication-service/auth-service/src/. ./
WORKDIR /src/AuthService.Api
RUN dotnet publish AuthService.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5065
ENTRYPOINT ["dotnet", "AuthService.Api.dll"]
