# 与 CI/CD 平台/工具集成

- [与 Github Action 的集成](#与-github-action-的集成)
- [与 Gitee Go 的集成](#与-gitee-go-的集成)
- [与 Jenkins 的集成](#与-jenkins-的集成)
- [注意事项](#注意事项)

## 与 Github Action 的集成

在 Github Action 的 Yaml 文件中，可以增加 Serverless Devs 的相关下载、配置以及命令执行相关能力。

例如，在仓库中可以创建该文件`.github/workflows/publish.yml`，文件内容：

```yaml
name: Serverless Devs Project CI/CD

on:
  push:
    branches: [ master ]

jobs:
  serverless-devs-cd:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 12
          registry-url: https://registry.npmjs.org/
      - run: npm install
      - run: npm install -g @serverless-devs/s
      - run: s config add --AccountID ${{secrets.AccountID}} --AccessKeyID ${{secrets.AccessKeyID}} --AccessKeySecret ${{secrets.AccessKeySecret}} -a default
      - run: s deploy
```

主要包括几个部分的内容：   
- `run: npm install -g @serverless-devs/s`:    
    通过NPM安装最新版本的 Serverless Devs 开发者工具；
- `run: s config add --AccountID ${{secrets.AccountID}} --AccessKeyID ${{secrets.AccessKeyID}} --AccessKeySecret ${{secrets.AccessKeySecret}} -a default`    
    通过`config`命令进行密钥等信息的配置；
- `run: s deploy`   
    执行某些命令，例如通过`deploy`进行项目的部署，或者`build`等命令进行构建等；

关于密钥的配置：密钥信息的获取是通过`${{secrets.*}}`进行获取的，所以此时，需要将所需要的密钥和对应的`Key`配置到 Github Secrets 中，例如在上面的案例中，需要`AccountID`,`AccessKeyID`,`AccessKeySecret`等三个密钥的 Key ，我们就可以配置相关的内容：

1. 将密钥信息配置到Github Secrets中
    ![](https://user-images.githubusercontent.com/21079031/120761131-71f28080-c547-11eb-9bb8-e08dafabb4ee.png)

2. 我们创建多对密钥信息：
    ![](https://user-images.githubusercontent.com/21079031/120761249-93ec0300-c547-11eb-9c0d-904fb85b4201.png)
   例如，我此处配置了三对密钥：
    ![](https://user-images.githubusercontent.com/21079031/120761347-ae25e100-c547-11eb-9bcd-4fc742671bc5.png)

> 关于密钥配置的部分注意内容，可以参考文末的[注意事项](#注意事项)

## 与 Gitee Go 的集成

在开启 Gitee Go 的服务之后，在流水线的 Yaml 文件中，可以增加 Serverless Devs 的相关下载、配置以及命令执行相关能力。

例如，在仓库中可以创建该文件`.github/workflows/publish.yml`，文件内容：

```yaml
name: serverless-devs
displayName: 'Serverless Devs Project CI/CD'
triggers:                                  # 流水线触发器配置
  push:                                    # 设置 master 分支 在产生代码 push 时精确触发（PRECISE）构建
    - matchType: PRECISE
      branch: master
commitMessage: ''                          # 通过匹配当前提交的 CommitMessage 决定是否执行流水线
stages:                                    # 构建阶段配置
  - stage:                                 # 定义一个 ID 标识为 deploy-stage ,名为「 Deploy Stage 」的阶段
      name: deploy-stage
      displayName: 'Deploy Stage'
      failFast: false                      # 允许快速失败，即当 Stage 中有任务失败时，直接结束整个 Stage

      steps:                               # 构建步骤配置
        - step: npmbuild@1                 # 采用 npm 编译环境
          name: deploy-step                # 定义一个 ID 标识为 deploy-step ,名为「 Deploy Step 」的阶段
          displayName: 'Deploy Step'
          inputs:                          # 构建输入参数设定
            nodeVersion: 14.15             # 指定 node 环境版本为 14.15
            goals: |                       # 安装依赖，配置相关主题、部署参数并发布部署
              node -v
              npm -v
              npm install -g @serverless-devs/s
              s config add --AccountID $ACCOUNTID --AccessKeyID $ACCESSKEYID --AccessKeySecret $ACCESSKEYSECRET -a default
              s deploy
```

主要包括几个部分的内容：   
- `npm install -g @serverless-devs/s`:    
    通过NPM安装最新版本的 Serverless Devs 开发者工具；
- `s config add --AccountID $ACCOUNTID --AccessKeyID $ACCESSKEYID --AccessKeySecret $ACCESSKEYSECRET -a default`    
    通过`config`命令进行密钥等信息的配置；
- `s deploy`   
    执行某些命令，例如通过`deploy`进行项目的部署，或者`build`等命令进行构建等；

关于密钥的配置：密钥信息的获取是通过`$*`进行获取的，所以此时，需要将所需要的密钥和对应的`Key`配置到 Gitee 的环境变量管理即可，例如在上面的案例中，需要`ACCOUNTID`,`ACCESSKEYID`,`ACCESSKEYSECRET`等三个密钥的 Key ，我们就可以配置相关的内容：

1. 找到 Gitee 的环境变量管理
    ![](https://user-images.githubusercontent.com/21079031/124716639-e5b4ee00-df36-11eb-9dc8-cf2d8eb30e51.png)

2. 我们创建多对密钥信息：
    ![](https://user-images.githubusercontent.com/21079031/124719394-aa67ee80-df39-11eb-84ad-944ccf0486ba.png)
   例如，我此处配置了三对密钥：
    ![](https://user-images.githubusercontent.com/21079031/124719496-c9ff1700-df39-11eb-8ef6-4ccae28caefc.png)

> 关于密钥配置的部分注意内容，可以参考文末的[注意事项](#注意事项)


## 与 Jenkins 的集成

在准备将 Serverless Devs 集成到 Jenkins 之前，需要先基于 [Jenkins 官网](https://www.jenkins.io/zh/doc/pipeline/tour/getting-started/) 安装并运行 Jenkins。

本地启动 Jenkins 后，通过浏览器进入链接 `http://localhost:8080` 配置完成基础设置后，需要新增 Credentials 设置，如下图所示：

![](https://img.alicdn.com/imgextra/i2/O1CN01tSgoo71Ne62AMGxqh_!!6000000001594-2-tps-3582-1048.png)

此时可以根据需要，增加密钥信息，以阿里云为例，新增三个全局凭据：

```
jenkins-alicloud-account-id : 阿里云 accountId

jenkins-alicloud-access-key-id : 阿里云 accessKeyId

jenkins-alicloud-access-key-secret : 阿里云 accessKeySecret
```

> 新增 Credentials 的教程可以参考[这里](https://www.jenkins.io/zh/doc/book/using/using-credentials/)。

此时，可以对自身的 Serverless Devs 项目进行完善：

- 创建文件`Jenkinsfile`
    ```
    pipeline {
        agent {
            docker {
                image 'maven:3.3-jdk-8'
            }
        }
    
        environment {
            ALICLOUD_ACCESS = 'default'
            ALICLOUD_ACCOUNT_ID     = credentials('jenkins-alicloud-account-id')
            ALICLOUD_ACCESS_KEY_ID     = credentials('jenkins-alicloud-access-key-id')
            ALICLOUD_ACCESS_KEY_SECRET     = credentials('jenkins-alicloud-access-key-secret')
        }
    
        stages {
            stage('Setup') {
                steps {
                    sh 'scripts/setup.sh'
                }
            }
        }
    }
    ```
    主要的内容包括两个部分：
    - environment 部分，主要是根据上面步骤配置的密钥信息，进行密钥的处理；
    - stages 部分，这里面会有一个部分是`sh 'scripts/setup.sh'`，即运行`scripts/setup.sh`文件，进行相关内容的准备和配置；
- 准备`scripts/setup.sh`文件，只需要在项目下，创建该文件即可：
    ```shell script
    #!/usr/bin/env bash
    
    echo $(pwd)
    curl -o- -L http://cli.so/install.sh | bash
    
    source ~/.bashrc
    
    echo $ALICLOUD_ACCOUNT_ID
    s config add --AccountID $ALICLOUD_ACCOUNT_ID --AccessKeyID $ALICLOUD_ACCESS_KEY_ID --AccessKeySecret $ALICLOUD_ACCESS_KEY_SECRET -a $ALICLOUD_ACCESS
    
    (cd code && mvn package && echo $(pwd))
    
    s deploy -y --use-local --access $ALICLOUD_ACCESS
    ```
    在该文件中，主要包括了几个部分：
    - `curl -o- -L http://cli.so/install.sh | bash`    
        下载并安装 Serverless Devs 开发者工具
    - `s config add --AccountID $ALICLOUD_ACCOUNT_ID --AccessKeyID $ALICLOUD_ACCESS_KEY_ID --AccessKeySecret $ALICLOUD_ACCESS_KEY_SECRET -a $ALICLOUD_ACCESS`    
        配置密钥信息等内容
    - `s deploy -y --use-local --access $ALICLOUD_ACCESS`   
        执行某些命令，例如通过`deploy`进行项目的部署，或者`build`等命令进行构建等；
    
    
完成密钥配置之后，可以创建一个 Jenkins 流水线，该流水线的源是目标 github 地址。接下来，就可以开始运行 Jenkins 流水线，运行结束后，就可以得到相关的内容结果。

> 关于密钥配置的部分注意内容，可以参考文末的[注意事项](#注意事项)


## 注意事项

- 在配置密钥的时候，使用了`s config add`命令，此时在最后有一个参数是`-a default`，代表的是给该密钥一个叫`default`的别名，这个别名要和项目所设定的使用密钥保持一致，例如在`s.yaml`中的`access`字段；
- 如果在当前应用在，涉及到了配置部署到不同的平台或者账号下，可能会涉及到配置多个密钥信息，此时需要给不同的密钥不同的别名，并且在`s.yaml`中进行使用；
- 如果想要配置更为灵活的密钥信息，可以考虑通过`-il`和`-kl`参数获取，例如同时配置两对密钥，并且使用自定义 Key ：
  ```yaml
  s config add -kl tempToken1,tempToken2 -il tempValue1,tempValue2 -a website_access
  s config add -kl tempToken3,tempToken4 -il tempValue3,tempValue4 -a fc_access
  ```
  
