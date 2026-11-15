import configPromise from '@payload-config'
import { RootLayout } from '@payloadcms/next/layouts'
import { importMap } from './importMap'
import React from 'react'

type Args = {
  children: React.ReactNode
}

const Layout = ({ children }: Args) => (
  <RootLayout config={configPromise} importMap={importMap}>
    {children}
  </RootLayout>
)

export default Layout
