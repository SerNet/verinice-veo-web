<!--
   - verinice.veo web
   - Copyright (C) 2024 Aziz Khalledi
   - 
   - This program is free software: you can redistribute it and/or modify it
   - under the terms of the GNU Affero General Public License
   - as published by the Free Software Foundation, either version 3 of the License,
   - or (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
   - without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
   - See the GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License along with this program.
   - If not, see <http://www.gnu.org/licenses/>.
-->
<template v-if="secondsToEffective">
  <div>
    <span>{{ t('remainingTime') }}</span>
    <span>{{ timeToEffective.hours }}:</span>
    <span>{{ timeToEffective.minutes }}:</span>
    <span>{{ timeToEffective.seconds }}</span>
  </div>
  <v-progress-linear :model-value="secondsToEffective" data-test-veo="timerInstance" />
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

<i18n src="~/locales/base/components/system-message-timer.json"></i18n>
