FROM cypress/base:14.15.4

# "root"
RUN whoami
# uid=0(root) gid=0(root) groups=0(root)
# meaning root
RUN id

# there is a built-in user "node" that comes from the very base Docker Node image
# we are going to recreate this user and give it _same id_ as external user
# that is going to run this container.
ARG USER_ID=1002
ARG GROUP_ID=1003

# if you want to see all existing groups uncomment the next command
# RUN cat /etc/group

RUN groupadd -g ${GROUP_ID} appuser
# do not log creating new user, otherwise there could be a lot of messages
RUN useradd -r --no-log-init -u ${USER_ID} -g appuser appuser
RUN install -d -m 0755 -o appuser -g appuser /home/appuser

USER appuser
# show user effective id and group - it should be non-zero
# meaning the current user is not root
RUN id

