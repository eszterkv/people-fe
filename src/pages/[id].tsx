import { useState } from 'react'
import { NextPageContext } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import styled from 'styled-components'

import t from '../i18n'
import invertRelationship from '../helpers/invert-relationship'
import uniqBy from '../helpers/uniq-by'
import { apiBase } from '../config'
import { ConfirmDelete } from '../components'
import { Button, Card, Grid, gap } from '../styled'

export default function Profile({ data }) {
  const {
    id,
    props: { name, 'full name': fullName, ...rest },
    edges,
  } = data

  const relationships = uniqBy(
    [...edges.out, ...edges.in.map(invertRelationship)],
    'id'
  )

  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const hide = () => {
    setShowConfirmDelete(false)
  }

  return (
    <>
      <Head>
        <title>
          {name} | {t('pageTitle')}
        </title>
      </Head>

      <h2>{name}</h2>
      {fullName && <FullName>{fullName}</FullName>}
      <Link href={`/edit/${id}`}>
        <Button as="a">{t('edit')}</Button>
      </Link>
      <dl>
        {Object.entries(rest)?.map(([key, value]) => (
          <div key={key}>
            <dt>{t(`props.${key}`)}</dt>
            <dd>{value || '—'}</dd>
          </div>
        ))}
      </dl>

      <h3>{t('connections')}:</h3>
      <Grid cols={4} style={{ marginBottom: '1rem' }}>
        {relationships?.map(({ id, name, type }) => (
          <Link key={id} href={`/${id}`}>
            <Card key={id} small>
              <a>{name}</a> ({type})
            </Card>
          </Link>
        ))}
      </Grid>
      <Link href={`/connections/${id}`}>
        <Button as="a">{t('createOrModifyConnection')}</Button>
      </Link>
      <p style={{ position: 'relative' }}>
        <Button onClick={() => setShowConfirmDelete(true)} intent="danger">
          {t('delete')}
        </Button>
        {showConfirmDelete && <ConfirmDelete id={id} hide={hide} />}
      </p>
    </>
  )
}

const FullName = styled.small`
  display: block;
  margin-bottom: ${gap}px;
`

export async function getServerSideProps(context: NextPageContext) {
  const res = await fetch(`${apiBase}/people/${context.query.id}`)
  const data = await res.json()

  return { props: { data } }
}
