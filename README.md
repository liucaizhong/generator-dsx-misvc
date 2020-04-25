# generator-dsx-misvc

[![npm version](https://badge.fury.io/js/generator-dsx-misvc.svg)](http://badge.fury.io/js/generator-dsx-misvc)

This package provides a DSX's generator to create your microservice.

## Usage

## Install Yeoman

```sh
# install yeoman globally
npm i -g yo
```

### Install the generator

### Option1: Install from Yeoman

1. Type `yo` in the terminal
2. Choose `Install a generator` and type `dsx-misvc` to search and install
3. You can use the generator once the installation is done.

### Option2: Install in local environment

```sh
# if you can't run yeoman, please try this:
export PATH=/usr/local/bin:$PATH
# step into the folder
cd generator-dsx-misvc
# install dependencies
npm install
# symlink to a local one
npm link
```

## Create your own microservice

```sh
# go to the folder
cd uberbot/components
# run generator directly
yo dsx-misvc <service-name> [options]
# help hints
yo dsx-misvc -h
```
