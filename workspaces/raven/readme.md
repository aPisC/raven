# Raven

Raven is a higher level dependency orchastration tool.

# Components

- module loader
- config loader
- plugin definitions
- orchastration base

# Plugin registration lifecycle

1. onRegister: adding plugin hooks and loaders
2. onInitialize: register interactions between plugins
3. onStart: start internal service layers
4. onListen: start external services
