// Settings per child: daily limit, study time, languages, country, easy-reading font, pause, delete.
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ParentChildPicker } from '@/components/ParentChildPicker';
import { Screen } from '@/components/Screen';
import { Btn, Card, Chip, Row, Txt } from '@/components/ui';
import { C, S } from '@/constants/theme';
import { useChild, useT } from '@/lib/store';
import { SUBJECTS } from '@/lib/subjects';
import { planAccess } from '@/lib/unlock';

const LIMITS = [15, 20, 30, 45, 60];
const TIMES = ['15:00', '16:00', '17:00', '18:00', '19:00'];

export default function Settings() {
  const { child, settings, app, plan, progress } = useChild();
  const access = planAccess(plan, progress);
  const { t } = useT();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Screen parent back="/parent" title={`⚙️ ${t('pSettings')}`}>
      <ParentChildPicker />
      {child ? (
        <View style={{ gap: S.md }}>
          <Card testID="lesson-order">
            <Txt bold>🔐 {t('pLessonOrder')}</Txt>
            <Txt variant="small">{t('pLessonOrderHint')}</Txt>
            {SUBJECTS.filter((s) => plan.some((p) => p.subject === s.id)).map((s) => (
              <View key={s.id} style={{ gap: S.xs }}>
                <Txt variant="small" bold>
                  {s.icon} {t(s.key)}
                </Txt>
                {plan
                  .filter((p) => p.subject === s.id)
                  .map((p, i, arr) => {
                    const a = access[p.id];
                    const label = a?.passed ? `✓ ${t('pIsPassed')}` : a?.pending ? `⏳ ${t('pendingTag')}` : a?.open ? t('pIsOpen') : `🔒 ${t('pIsLocked')}`;
                    return (
                      <Row key={p.id} wrap testID={`order-${p.topic}`}>
                        <Txt style={{ flex: 1, minWidth: 120 }}>
                          {i + 1}. {p.topic} · <Txt variant="small">{label}</Txt>
                        </Txt>
                        <Btn small variant="ghost" title="↑" a11yLabel={t('moveUp')} disabled={i === 0} onPress={() => app.movePlanItem(child.id, p.id, -1)} testID={`up-${p.topic}`} />
                        <Btn small variant="ghost" title="↓" a11yLabel={t('moveDown')} disabled={i === arr.length - 1} onPress={() => app.movePlanItem(child.id, p.id, 1)} testID={`down-${p.topic}`} />
                        {!a?.passed && (p.unlocked || !a?.open) ? (
                          <Btn
                            small
                            variant="secondary"
                            title={p.unlocked ? t('pRelock') : `🔓 ${t('pUnlock')}`}
                            onPress={() => app.setPlanItem(child.id, p.id, { unlocked: !p.unlocked })}
                            testID={`unlock-${p.topic}`}
                          />
                        ) : null}
                      </Row>
                    );
                  })}
              </View>
            ))}
          </Card>
          <Card>
            <Txt bold>{t('dailyLimit')}</Txt>
            <Row wrap>
              {LIMITS.map((m) => (
                <Chip key={m} label={t('minN', { n: m })} selected={settings.dailyLimitMin === m} onPress={() => app.updateSettings(child.id, { dailyLimitMin: m })} testID={`limit-${m}`} />
              ))}
            </Row>
          </Card>
          <Card>
            <Txt bold>{t('studyTime')}</Txt>
            <Row wrap>
              {TIMES.map((x) => (
                <Chip key={x} label={x} selected={settings.studyTime === x} onPress={() => app.updateSettings(child.id, { studyTime: x })} />
              ))}
            </Row>
          </Card>
          <Card>
            <Txt bold>{t('childLang')}</Txt>
            <Row wrap>
              <Chip label="English" selected={child.lang === 'en'} onPress={() => app.updateChild(child.id, { lang: 'en' })} testID="child-lang-en" />
              <Chip label="العربية" selected={child.lang === 'ar'} onPress={() => app.updateChild(child.id, { lang: 'ar' })} testID="child-lang-ar" />
            </Row>
          </Card>
          <Card>
            <Txt bold>{t('reportLang')}</Txt>
            <Row wrap>
              <Chip label="English" selected={settings.reportLang === 'en'} onPress={() => app.updateSettings(child.id, { reportLang: 'en' })} testID="report-lang-en" />
              <Chip label="العربية" selected={settings.reportLang === 'ar'} onPress={() => app.updateSettings(child.id, { reportLang: 'ar' })} testID="report-lang-ar" />
            </Row>
          </Card>
          <Card>
            <Txt bold>{t('country')}</Txt>
            <Row wrap>
              <Chip label={`🇱🇧 ${t('lebanon')}`} selected={settings.country === 'LB'} onPress={() => app.updateSettings(child.id, { country: 'LB' })} testID="country-LB" />
              <Chip label={`🇶🇦 ${t('qatar')}`} selected={settings.country === 'QA'} onPress={() => app.updateSettings(child.id, { country: 'QA' })} testID="country-QA" />
            </Row>
          </Card>
          <Card>
            <Txt bold>{t('dyslexia')}</Txt>
            <Row wrap>
              <Chip label={t('on')} selected={settings.dyslexiaFont} onPress={() => app.updateSettings(child.id, { dyslexiaFont: true })} testID="dyslexia-on" />
              <Chip label={t('off')} selected={!settings.dyslexiaFont} onPress={() => app.updateSettings(child.id, { dyslexiaFont: false })} testID="dyslexia-off" />
            </Row>
          </Card>
          <Card>
            <Txt bold>{t('pauseZaki')}</Txt>
            <Row wrap>
              <Chip label={t('on')} selected={settings.paused} onPress={() => app.updateSettings(child.id, { paused: true })} />
              <Chip label={t('off')} selected={!settings.paused} onPress={() => app.updateSettings(child.id, { paused: false })} />
            </Row>
          </Card>
          <Card tone="coral">
            {confirmDelete ? (
              <>
                <Txt>{t('deleteConfirm', { name: child.nickname })}</Txt>
                <Row wrap>
                  <Btn
                    small
                    variant="help"
                    title={t('deleteYes')}
                    onPress={() => {
                      app.deleteChild(child.id);
                      setConfirmDelete(false);
                      router.replace('/parent');
                    }}
                  />
                  <Btn small variant="secondary" title={t('cancel')} onPress={() => setConfirmDelete(false)} />
                </Row>
              </>
            ) : (
              <Btn small variant="secondary" title={t('deleteChild')} onPress={() => setConfirmDelete(true)} style={{ borderColor: C.coral }} />
            )}
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}
