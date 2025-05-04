"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { BookOpen, Menu, X, User, LogOut, MessageSquare } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const auth = useAuth()

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">StudyPing</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              홈
            </Link>

            {/* Chat Dropdown */}
            {auth.user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium relative">
                    채팅
                    {/* Optional: Badge on the trigger itself */}
                    {/* {auth.joinedChatRooms.some(room => room.unReadCount > 0) && (
                       <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                         !
                       </span>
                     )} */}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="start"> {/* Increased width slightly */}
                  <DropdownMenuLabel>참여 중인 스터디 채팅</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {auth.isLoadingChats ? (
                    <div className="p-2 space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[120px]" />
                    </div>
                  ) : auth.joinedChatRooms.length > 0 ? (
                    // Use joinedChatRooms state
                    auth.joinedChatRooms.map((room) => (
                      <DropdownMenuItem key={room.roomId} asChild className="cursor-pointer flex justify-between items-center">
                        {/* Use roomId for the link */}
                        <Link href={`/studies/${room.roomId}/chat`}>
                          <div className="flex items-center">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>{room.title}</span>
                          </div>
                           {/* Display unread count badge */}
                          {room.unReadCount > 0 && (
                            <Badge variant="destructive" className="ml-auto">{room.unReadCount}</Badge>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <p className="p-2 text-sm text-gray-500">참여 중인 채팅이 없습니다.</p>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {/* End Chat Dropdown */}

            <Link href="/studies" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              스터디 목록
            </Link>
            {auth.user && (
              <Link href="/my-studies" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                내 스터디
              </Link>
            )}
            <Link href="/create" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              스터디 생성
            </Link>

            {/* User Profile / Login Button */}
            {auth.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{auth.user.name ? auth.user.name[0].toUpperCase() : '?'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {auth.user.name}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/my-studies" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>내 스터디</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={auth.logout} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>로그아웃</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="default">
                  로그인
                </Button>
              </Link>
            )}
          </div>

           {/* Mobile Navigation Toggle - Integrated into User Dropdown/Login */}
          <div className="md:hidden flex items-center">
            {auth.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>{auth.user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/" onClick={() => setIsMenuOpen(false)}>홈</Link>
                  </DropdownMenuItem>

                  {/* Mobile Chat Section */}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>채팅</DropdownMenuLabel>
                  {auth.isLoadingChats ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">로딩중...</div>
                  ) : auth.joinedChatRooms.length > 0 ? (
                      auth.joinedChatRooms.map((room) => (
                      <DropdownMenuItem key={`mobile-${room.roomId}`} asChild className="cursor-pointer flex justify-between items-center">
                        <Link href={`/studies/${room.roomId}/chat`} onClick={() => setIsMenuOpen(false)}>
                            <div className="flex items-center">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              <span>{room.title}</span>
                            </div>
                            {room.unReadCount > 0 && (
                              <Badge variant="destructive" className="ml-auto">{room.unReadCount}</Badge>
                            )}
                        </Link>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">참여 중인 채팅 없음</div>
                  )}
                  <DropdownMenuSeparator />
                  {/* End Mobile Chat Section */}

                  <DropdownMenuItem asChild>
                    <Link href="/studies" onClick={() => setIsMenuOpen(false)}>스터디 목록</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-studies" onClick={() => setIsMenuOpen(false)}>내 스터디</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/create" onClick={() => setIsMenuOpen(false)}>스터디 생성</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { auth.logout(); setIsMenuOpen(false); }} className="text-red-600 focus:text-red-600">
                     <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button size="sm">로그인</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
