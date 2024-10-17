<template v-if="secondsToEffective">
  <div>
    <span>{{ t('remainingTime') }}</span>
    <span>{{ timeToEffective.hours }}:</span>
    <span>{{ timeToEffective.minutes }}:</span>
    <span>{{ timeToEffective.seconds }}</span>
  </div>
  <v-progress-linear :model-value="secondsToEffective"> </v-progress-linear>
</template>

<script setup lang="ts">
type Props = { effectiveDate: Date };
const props = withDefaults(defineProps<Props>(), {
  effectiveDate: () => new Date()
});

const { t } = useI18n();

const timerInstance = ref();
const secondsToEffective = ref();
const timeToEffective = ref({
  hours: '00',
  minutes: '00',
  seconds: '00'
});

function update() {
  if (secondsToEffective.value <= 0) stop();

  secondsToEffective.value = Math.floor((new Date(props.effectiveDate).valueOf() - new Date().valueOf()) / 1000);
  const minutesToEffective = Math.floor(secondsToEffective.value / 60);

  const hours = Math.floor(minutesToEffective / 60).toString();
  const minutes = (minutesToEffective % 60).toString();
  const seconds = (secondsToEffective.value % 60).toString();

  timeToEffective.value = {
    hours: hours.length == 1 ? `0${hours}` : hours,
    minutes: minutes.length == 1 ? `0${minutes}` : minutes,
    seconds: seconds.length == 1 ? `0${seconds}` : seconds
  };
}

function start() {
  if (timerInstance.value) return;
  timerInstance.value = setInterval(() => {
    update();
  }, 1000);
}

function stop() {
  clearInterval(timerInstance.value);
}

onMounted(() => {
  start();
});

onBeforeUnmount(() => {
  stop();
});
</script>
<i18n>
{
  "en": {
    "remainingTime": "Remaining time: ",
  },
  "de": {
    "remainingTime": "Verbleibende Zeit: ",
  }
}
</i18n>
